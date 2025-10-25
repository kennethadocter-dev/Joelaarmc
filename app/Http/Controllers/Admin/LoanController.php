<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Setting;
use App\Models\LoanSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoanCompletedMail;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\Log;
use App\Helpers\SmsNotifier;

class LoanController extends Controller
{
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** 📋 Show all loans */
    public function index(Request $request)
    {
        try {
            $statusFilter = $request->query('status');
            $clientFilter = $request->query('client');

            $raw = Loan::selectRaw("status, COUNT(*) as cnt")
                ->groupBy('status')->pluck('cnt', 'status')->toArray();

            $rawSums = Loan::selectRaw("status, SUM(amount) as sum_amount")
                ->groupBy('status')->pluck('sum_amount', 'status')->toArray();

            $summary = [
                'active' => [
                    'count' => (int)($raw['active'] ?? 0) + (int)($raw['overdue'] ?? 0),
                    'sum'   => (float)($rawSums['active'] ?? 0) + (float)($rawSums['overdue'] ?? 0),
                ],
                'pending' => [
                    'count' => (int)($raw['pending'] ?? 0),
                    'sum'   => (float)($rawSums['pending'] ?? 0),
                ],
                'paid' => [
                    'count' => (int)($raw['paid'] ?? 0),
                    'sum'   => (float)($rawSums['paid'] ?? 0),
                ],
                'overdue' => [
                    'count' => (int)($raw['overdue'] ?? 0),
                    'sum'   => (float)($rawSums['overdue'] ?? 0),
                ],
            ];

            $query = Loan::with(['customer', 'user']);
            if ($clientFilter) $query->where('client_name', 'like', "%{$clientFilter}%");
            if ($statusFilter) {
                if ($statusFilter === 'active') {
                    $query->whereIn('status', ['active', 'overdue']);
                } else {
                    $query->where('status', $statusFilter);
                }
            }

            $loans = $query->orderByDesc('created_at')->get();

            return Inertia::render('Admin/Loans/Index', [
                'loans'    => $loans,
                'summary'  => $summary,
                'filters'  => ['client' => $clientFilter, 'status' => $statusFilter],
                'auth'     => ['user' => auth()->user()],
                'flash'    => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load loan list.');
        }
    }

    /** 🧍 Customer-specific loans */
    public function customerLoans(Customer $customer)
    {
        try {
            $loans = Loan::with(['user', 'payments', 'loanSchedules'])
                ->where('customer_id', $customer->id)
                ->latest()
                ->get();

            return Inertia::render('Admin/Loans/CustomerLoans', [
                'customer' => $customer,
                'loans'    => $loans,
                'auth'     => ['user' => auth()->user()],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Could not load customer loans.');
        }
    }

    /** 📝 Create Loan Form */
    public function create(Request $request)
    {
        try {
            $prefillClientName = $request->query('client_name', '');
            $prefillCustomerId = $request->query('customer_id', '');

            if (!$prefillCustomerId || !$prefillClientName) {
                return redirect()->route($this->basePath() . '.customers.index')
                    ->with('error', '⚠️ Select or register a customer first.');
            }

            $customer = Customer::find($prefillCustomerId);
            $settings = Setting::first();

            return Inertia::render('Admin/Loans/Create', [
                'auth'                  => ['user' => auth()->user()],
                'prefill_client_name'   => $prefillClientName,
                'prefill_customer_id'   => $prefillCustomerId,
                'suggested_due_date'    => now()->addMonth()->format('Y-m-d'),
                'suggested_amount'      => $customer?->loan_amount_requested ?? null,
                'defaults' => [
                    'interest_rate' => $settings?->default_interest_rate ?? 20,
                    'term_months'   => min($settings?->default_term_months ?? 6, 6),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Could not open loan creation form.');
        }
    }

    /** 💾 Store Loan + Generate Schedule + Send SMS */
    public function store(Request $request)
    {
        ini_set('max_execution_time', 45);

        try {
            $validated = $request->validate([
                'customer_id'  => 'required|exists:customers,id',
                'client_name'  => 'required|string|max:255',
                'amount'       => 'required|numeric|min:1',
                'interest_rate'=> 'required|numeric|min:0',
                'term_months'  => 'required|integer|min:1|max:6',
                'start_date'   => 'required|date',
                'due_date'     => 'nullable|date|after_or_equal:start_date',
                'notes'        => 'nullable|string|max:500',
            ]);

            Loan::where('customer_id', $validated['customer_id'])
                ->whereIn('status', ['active', 'overdue'])
                ->update(['status' => 'paid']);

            DB::beginTransaction();

            $amount = (float)$validated['amount'];
            $term   = (int)$validated['term_months'];
            $rate   = (float)$validated['interest_rate'];

            $interestMultipliers = [
                1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83,
            ];

            $multiplier = $interestMultipliers[$term] ?? (1 + $rate / 100);
            $totalDue   = $amount * $multiplier;

            $round2 = fn($num) => round($num, 2);
            $installments = [];
            $rawMonthly = $totalDue / $term;
            $totalAssigned = 0.00;

            for ($i = 1; $i <= $term; $i++) {
                if ($i < $term) {
                    $amountForThis = $round2($rawMonthly);
                    $totalAssigned += $amountForThis;
                } else {
                    $amountForThis = $round2($totalDue - $totalAssigned);
                }
                $installments[$i] = (float)$amountForThis;
            }

            $dueDate = $validated['due_date']
                ? Carbon::parse($validated['due_date'])
                : Carbon::parse($validated['start_date'])->addMonths($term);

            $loan = Loan::create([
                'user_id'          => auth()->id(),
                'customer_id'      => $validated['customer_id'],
                'client_name'      => $validated['client_name'],
                'amount'           => $amount,
                'interest_rate'    => $rate,
                'term_months'      => $term,
                'start_date'       => $validated['start_date'],
                'due_date'         => $dueDate,
                'amount_paid'      => 0.00,
                'amount_remaining' => $totalDue,
                'notes'            => $validated['notes'] ?? null,
                'status'           => 'pending',
            ]);

            for ($i = 1; $i <= $term; $i++) {
                LoanSchedule::create([
                    'loan_id'          => $loan->id,
                    'payment_number'   => $i,
                    'amount'           => (float)$installments[$i],
                    'amount_paid'      => 0.00,
                    'remaining_amount' => (float)$installments[$i],
                    'is_paid'          => 0,
                    'due_date'         => Carbon::parse($validated['start_date'])->addMonths($i),
                    'note'             => 'Pending',
                ]);
            }

            ActivityLogger::log('Created Loan', "Loan #{$loan->id} created for {$loan->client_name}");

            // 📨 SMS: Notify customer
            if (!empty($loan->customer?->phone)) {
                $msg = "Hi {$loan->client_name}, your loan of ₵" . number_format($loan->amount, 2) .
                    " has been created successfully and is pending approval. Thank you for choosing Joelaar!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            DB::commit();

            return redirect()->route($this->basePath() . '.loans.index')
                ->with('success', '✅ Loan created successfully and schedule generated.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->handleError($e, '⚠️ Loan creation failed.');
        }
    }

    /** ✅ Activate loan + Notify customer */
    public function activate(Loan $loan)
    {
        try {
            $me = auth()->user();

            if (!$me || !in_array($me->role, ['admin', 'staff', 'superadmin', 'superuser'], true)) {
                abort(403, 'Unauthorized.');
            }

            if ($loan->status !== 'pending') {
                return back()->with('error', 'Only pending loans can be activated.');
            }

            $loan->update([
                'status' => 'active',
                'disbursed_at' => now(),
            ]);

            ActivityLogger::log('Activated Loan', "Loan #{$loan->id} activated by {$me->name}");

            // 📨 SMS: Loan activation
            if (!empty($loan->customer?->phone)) {
                $msg = "Hi {$loan->client_name}, your loan #{$loan->id} is now active. Please remember to make payments on schedule. Thank you!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Loan activated successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to activate loan.');
        }
    }

    /** 💵 Record payment + Notify customer */
    public function recordPayment(Request $request, Loan $loan)
    {
        try {
            $validated = $request->validate([
                'amount'    => 'required|numeric|min:1',
                'paid_at'   => 'required|date',
                'reference' => 'nullable|string|max:255',
                'note'      => 'nullable|string|max:500',
            ]);

            $totalWithInterest = $loan->amount + ($loan->amount * ($loan->interest_rate ?? 0) / 100);
            $alreadyPaid = DB::table('payments')->where('loan_id', $loan->id)->sum('amount');
            $remaining = max($totalWithInterest - $alreadyPaid, 0);

            if ($validated['amount'] > $remaining + 0.009) {
                $allowed = number_format($remaining, 2);
                return back()->with('error', "⚠️ Only ₵{$allowed} remaining for this loan.");
            }

            DB::beginTransaction();

            $payment = Payment::create([
                'loan_id'        => $loan->id,
                'received_by'    => auth()->id(),
                'amount'         => $validated['amount'],
                'paid_at'        => $validated['paid_at'],
                'payment_method' => 'cash',
                'reference'      => $validated['reference'] ?? null,
                'note'           => $validated['note'] ?? null,
            ]);

            DB::commit();

            // 📨 SMS: Payment recorded
            if (!empty($loan->customer?->phone)) {
                $remainingAfter = max($loan->amount_remaining - $payment->amount, 0);
                $msg = "Hi {$loan->client_name}, we've received your payment of ₵" . number_format($payment->amount, 2) .
                    ". Remaining balance: ₵" . number_format($remainingAfter, 2) . ". Thank you!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            // 🕒 Check if fully paid → trigger completion logic
            $totalPaid = DB::table('payments')->where('loan_id', $loan->id)->sum('amount');
            if ($totalPaid >= $totalWithInterest - 0.01) {
                $loan->update(['status' => 'paid', 'amount_remaining' => 0]);
                ActivityLogger::log('Completed Loan', "Loan #{$loan->id} fully paid automatically.");

                // ✅ Send Loan Completed Email + SMS
                if (!empty($loan->customer?->email)) {
                    Mail::to($loan->customer->email)->send(new LoanCompletedMail($loan));
                }
                if (!empty($loan->customer?->phone)) {
                    $msg = "🎉 Congratulations {$loan->client_name}! Your loan of ₵" . number_format($loan->amount, 2) .
                        " is now fully paid off. Thank you for being a valued Joelaar customer!";
                    SmsNotifier::send($loan->customer->phone, $msg);
                }
            }

            return Inertia::location(route($this->basePath() . '.loans.show', $loan->id));
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->handleError($e, '⚠️ Failed to record payment.');
        }
    }

    /** 🎉 Mark loan as fully paid + Notify customer */
    public function complete(Loan $loan)
    {
        try {
            if ($loan->status === 'paid') {
                return back()->with('info', 'Loan already marked as paid.');
            }

            $loan->update([
                'status' => 'paid',
                'amount_remaining' => 0,
            ]);

            ActivityLogger::log('Completed Loan', "Loan #{$loan->id} marked as fully paid by " . auth()->user()->name);

            // ✅ Send Loan Completed Email + SMS
            if (!empty($loan->customer?->email)) {
                Mail::to($loan->customer->email)->send(new LoanCompletedMail($loan));
            }

            if (!empty($loan->customer?->phone)) {
                $msg = "🎉 Congratulations {$loan->client_name}! Your loan of ₵" . number_format($loan->amount, 2) .
                    " is now fully paid off. Thank you for being a valued Joelaar customer!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            return back()->with('success', '✅ Loan marked as completed.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to complete loan.');
        }
    }

    /** 📊 Loans by month */
    public function getLoansByYear(Request $request)
    {
        try {
            $year = $request->query('year', date('Y'));
            $rows = DB::table('loans')
                ->select(DB::raw('EXTRACT(MONTH FROM created_at) as month_key'), DB::raw('COUNT(*) as total_loans'))
                ->whereYear('created_at', $year)
                ->groupBy(DB::raw('EXTRACT(MONTH FROM created_at)'))
                ->orderBy(DB::raw('EXTRACT(MONTH FROM created_at)'))
                ->pluck('total_loans', 'month_key');

            $result = [];
            for ($m = 1; $m <= 12; $m++) {
                $key = str_pad($m, 2, '0', STR_PAD_LEFT);
                $result[$key] = (int)($rows[$key] ?? 0);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('❌ getLoansByYear failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load data.'], 500);
        }
    }

    /** 🧰 Unified error handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ LoanController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.loans.index')
            ->with('error', $message);
    }
}