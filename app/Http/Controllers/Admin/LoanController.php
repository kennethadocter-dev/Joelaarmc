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
use App\Mail\LoanCreatedMail;
use App\Mail\LoanActivatedMail;
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

    /** 💾 Store Loan + Generate Schedule + Notify */
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

            DB::beginTransaction();

            $amount = (float)$validated['amount'];
            $term   = (int)$validated['term_months'];
            $rate   = (float)$validated['interest_rate'];

            $interestMultipliers = [
                1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83,
            ];

            $multiplier = $interestMultipliers[$term] ?? (1 + $rate / 100);
            $totalDue   = round($amount * $multiplier, 2);
            $interestEarned = round($totalDue - $amount, 2);

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
                'interest_earned'  => $interestEarned,
                'notes'            => $validated['notes'] ?? null,
                'status'           => 'pending',
            ]);

            // Generate monthly schedule
            for ($i = 1; $i <= $term; $i++) {
                LoanSchedule::create([
                    'loan_id'        => $loan->id,
                    'payment_number' => $i,
                    'amount'         => (float)$installments[$i],
                    'amount_paid'    => 0.00,
                    'amount_left'    => (float)$installments[$i],
                    'is_paid'        => false,
                    'due_date'       => Carbon::parse($validated['start_date'])->addMonths($i),
                    'note'           => 'Pending',
                ]);
            }

            $loan->update([
                'amount_remaining' => LoanSchedule::where('loan_id', $loan->id)->sum('amount_left'),
            ]);

            ActivityLogger::log('Created Loan', "Loan #{$loan->id} created for {$loan->client_name}");

            if (!empty($loan->customer?->email)) {
                Mail::to($loan->customer->email)->send(new LoanCreatedMail($loan));
            }

            if (!empty($loan->customer?->phone)) {
                $msg = "Hi {$loan->client_name}, your loan of ₵" . number_format($loan->amount, 2) .
                    " has been created successfully and is pending approval. " .
                    "Total repayment: ₵" . number_format($totalDue, 2) .
                    " across {$loan->term_months} months.";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            DB::commit();
            return redirect()->route($this->basePath() . '.loans.index');
        } catch (\Throwable $e) {
            DB::rollBack();
            dd('Loan creation error:', $e->getMessage(), $e->getTraceAsString());
        }
    }

    /** 💵 Record Cash Payment */
    public function recordPayment(Request $request, Loan $loan)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'note'   => 'nullable|string|max:255',
            ]);

            $user = auth()->user();

            DB::beginTransaction();

            $nextSchedule = $loan->loanSchedules()
                ->where('is_paid', false)
                ->orderBy('payment_number')
                ->first();

            // Create payment record
            $payment = Payment::create([
                'loan_id'      => $loan->id,
                'amount'       => $validated['amount'],
                'paid_at'      => now(),
                'received_by'  => $user->id, // ✅ now stores user ID
                'payment_method' => 'cash',
                'note'         => $validated['note'] ?? null,
            ]);

            if ($nextSchedule) {
                $nextSchedule->amount_paid += $validated['amount'];
                $nextSchedule->amount_left = max(0, $nextSchedule->amount - $nextSchedule->amount_paid);
                $nextSchedule->is_paid = $nextSchedule->amount_left <= 0;
                $nextSchedule->note = $validated['note'] ?? $nextSchedule->note;
                $nextSchedule->save();
            }

            // Update loan totals
            $loan->amount_paid = $loan->payments()->sum('amount');
            $loan->amount_remaining = $loan->loanSchedules()->sum('amount_left');
            $loan->status = $loan->amount_remaining <= 0 ? 'paid' : 'active';
            $loan->save();

            ActivityLogger::log('Recorded Payment', "₵{$validated['amount']} received for Loan #{$loan->id} by {$user->name}");

            DB::commit();

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Cash payment recorded successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->handleError($e, '⚠️ Failed to record payment.');
        }
    }

    /** 👁️ Show single loan details */
    public function show(Loan $loan)
    {
        try {
            $loan->loadMissing([
                'customer',
                'user',
                'payments' => fn($q) => $q->with('receivedByUser')->orderByDesc('paid_at'),
                'loanSchedules' => fn($q) => $q->orderBy('payment_number'),
            ]);

            $totalPaid = $loan->payments->sum('amount');
            $remaining = max(($loan->amount_remaining ?? 0), 0);

            if ($remaining <= 0 && $loan->status !== 'paid') {
                $loan->update(['status' => 'paid']);
            } elseif ($remaining > 0 && !in_array($loan->status, ['pending', 'active'])) {
                $loan->update(['status' => 'active']);
            }

            $schedules = $loan->loanSchedules->map(function ($s) use ($loan) {
                $expected = $s->amount;
                $paid = Payment::where('loan_id', $loan->id)
                    ->whereBetween('paid_at', [
                        Carbon::parse($s->due_date)->startOfMonth(),
                        Carbon::parse($s->due_date)->endOfMonth(),
                    ])
                    ->sum('amount');
                $s->status = $paid >= $expected ? 'Paid' : ($paid > 0 ? 'Partial' : 'Pending');
                $s->total_paid_this_month = round($paid, 2);
                return $s;
            });

            return Inertia::render('Admin/Loans/Show', [
                'loan'          => $loan->fresh(['customer','user','payments.receivedByUser','loanSchedules']),
                'loanSchedules' => $schedules,
                'totalPaid'     => $totalPaid,
                'remaining'     => $remaining,
                'auth'          => ['user' => auth()->user()],
                'basePath'      => $this->basePath(),
                'flash'         => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load loan details.');
        }
    }

    /** ✅ Activate loan */
    public function activate(Loan $loan)
    {
        try {
            $me = auth()->user();
            if (!$me || !in_array($me->role, ['admin', 'staff', 'superadmin', 'superuser'], true)) {
                abort(403, 'Unauthorized.');
            }

            if ($loan->status === 'active') {
                return back()->with('info', 'Loan already active.');
            }

            $loan->update([
                'status' => 'active',
                'disbursed_at' => now(),
            ]);

            ActivityLogger::log('Activated Loan', "Loan #{$loan->id} activated by {$me->name}");

            if (!empty($loan->customer?->email)) {
                Mail::to($loan->customer->email)->send(new LoanActivatedMail($loan));
            }

            if (!empty($loan->customer?->phone)) {
                $msg = "Hi {$loan->client_name}, your loan #{$loan->id} is now active.";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Loan activated successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to activate loan.');
        }
    }

    /** 🧰 Error handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ LoanController Error', [
            'route' => request()->path(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return redirect()
            ->route($this->basePath() . '.loans.index')
            ->with('error', $message);
    }
}