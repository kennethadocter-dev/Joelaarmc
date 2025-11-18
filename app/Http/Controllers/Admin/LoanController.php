<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Customer;
use App\Models\LoanSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Helpers\ActivityLogger;
use App\Helpers\SmsNotifier;
use App\Mail\LoanCreatedMail;
use App\Mail\LoanCompletedMail;

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

    /** 📋 List all loans (Dashboard Summary Included) */
    public function index(Request $request)
    {
        try {
            $statusFilter = $request->query('status');
            $clientFilter = $request->query('client');

            // Simple stats; can optimize later if needed
            $summary = [
                'active' => [
                    'count' => Loan::whereIn('status', ['active', 'overdue'])->count(),
                    'sum'   => Loan::whereIn('status', ['active', 'overdue'])->sum('amount'),
                    'expected_interest' => Loan::whereIn('status', ['active', 'overdue'])->sum('expected_interest'),
                ],
                'pending' => [
                    'count' => Loan::where('status', 'pending')->count(),
                    'sum'   => Loan::where('status', 'pending')->sum('amount'),
                    'expected_interest' => Loan::where('status', 'pending')->sum('expected_interest'),
                ],
                'paid' => [
                    'count' => Loan::where('status', 'paid')->count(),
                    'sum'   => Loan::where('status', 'paid')->sum('amount'),
                    'expected_interest' => 0.00,
                ],
                'overdue' => [
                    'count' => Loan::where('status', 'overdue')->count(),
                    'sum'   => Loan::where('status', 'overdue')->sum('amount'),
                    'expected_interest' => Loan::where('status', 'overdue')->sum('expected_interest'),
                ],
            ];

            $totalExpectedInterest = Loan::whereIn('status', ['active', 'overdue', 'pending'])
                ->sum('expected_interest');

            $query = Loan::with(['customer', 'user'])
                ->when($clientFilter, fn($q) =>
                    $q->where('client_name', 'like', "%{$clientFilter}%")
                )
                ->when($statusFilter, function ($q) use ($statusFilter) {
                    if ($statusFilter === 'active') {
                        $q->whereIn('status', ['active', 'overdue']);
                    } else {
                        $q->where('status', $statusFilter);
                    }
                })
                ->orderByDesc('created_at');

            return Inertia::render('Admin/Loans/Index', [
                'loans'   => $query->get(),
                'summary' => $summary,
                'totalExpectedInterest' => round($totalExpectedInterest, 2),
                'filters' => [
                    'client' => $clientFilter,
                    'status' => $statusFilter,
                ],
                'auth'    => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load loan list.');
        }
    }

    /** 🧾 Create form */
    public function create(Request $request)
    {
        try {
            $prefillCustomerId = $request->query('customer_id');
            $prefillClientName = $request->query('client_name');
            $prefillAmount     = $request->query('amount_requested');

            if (empty($prefillCustomerId) || !is_numeric($prefillCustomerId)) {
                return redirect()
                    ->route($this->basePath() . '.customers.index')
                    ->with('error', '⚠️ Please select a valid customer first.');
            }

            $customer = Customer::find($prefillCustomerId);
            if (!$customer) {
                return redirect()
                    ->route($this->basePath() . '.customers.index')
                    ->with('error', '⚠️ Selected customer does not exist.');
            }

            return Inertia::render('Admin/Loans/Create', [
                'auth' => ['user' => auth()->user()],
                'prefill_customer_id' => $customer->id,
                'prefill_client_name' => $prefillClientName ?: $customer->full_name,
                'prefill_amount'      => $prefillAmount ?: $customer->loan_amount_requested,
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Could not open loan creation form.');
        }
    }

    /** 💾 Store new loan — with idempotency & notifications */
    public function store(Request $request)
    {
        ini_set('max_execution_time', 45);

        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'client_name' => 'required|string|max:255',
                'loan_code'   => 'nullable|string|max:50|unique:loans,loan_code',
                'amount'      => 'required|numeric|min:1',
                'term_months' => 'required|integer|min:1|max:6',
                'start_date'  => 'required|date',
                'notes'       => 'nullable|string|max:500',
            ], [
                'loan_code.unique'    => '⚠️ This loan code is already in use.',
                'customer_id.exists'  => '⚠️ Selected customer does not exist.',
            ]);

            $amount = (float) $validated['amount'];
            $term   = (int) $validated['term_months'];
            $start  = Carbon::parse($validated['start_date'])->startOfDay();

            /**
             * ✅ IDEMPOTENCY GUARD
             * If the same loan (customer, amount, term, start_date) was created
             * in the last 2 minutes, assume this is a duplicate button click.
             */
            $recentExisting = Loan::where('customer_id', $validated['customer_id'])
                ->where('amount', $amount)
                ->where('term_months', $term)
                ->whereDate('start_date', $start->toDateString())
                ->where('created_at', '>=', now()->subMinutes(2))
                ->latest('id')
                ->first();

            if ($recentExisting) {
                return redirect()
                    ->route($this->basePath() . '.loans.show', $recentExisting->id)
                    ->with('success', '✅ Loan was already created recently. Duplicate submission ignored.');
            }

            DB::beginTransaction();

            $loan = new Loan([
                'user_id'       => auth()->id(),
                'customer_id'   => $validated['customer_id'],
                'client_name'   => $validated['client_name'],
                'loan_code'     => $validated['loan_code'] ?? 'LN' . strtoupper(uniqid()),
                'amount'        => $amount,
                'term_months'   => $term,
                'start_date'    => $start,
                'due_date'      => $start->copy()->addMonths($term),
                'interest_rate' => 20,
                'interest_earned' => 0,
                'notes'         => $validated['notes'] ?? null,
            ]);

            // Calculate interest & totals using model helpers
            $loan->expected_interest   = $loan->calculateExpectedInterest();
            $loan->total_with_interest = $loan->calculateTotalWithInterest();
            $loan->amount_paid         = 0.00;
            $loan->amount_remaining    = $loan->total_with_interest;
            $loan->status              = 'active';
            $loan->save();

            // 🔢 Generate monthly schedules safely (ensure sums match exactly)
            $monthly = round($loan->total_with_interest / $term, 2);
            $sum = 0;

            for ($i = 1; $i <= $term; $i++) {
                // Last installment adjusts for rounding difference
                $paymentAmount = ($i < $term)
                    ? $monthly
                    : round($loan->total_with_interest - $sum, 2);

                $sum += $paymentAmount;

                LoanSchedule::create([
                    'loan_id'        => $loan->id,
                    'payment_number' => $i,
                    'amount'         => $paymentAmount,
                    'amount_paid'    => 0.00,
                    'amount_left'    => $paymentAmount,
                    'is_paid'        => false,
                    'due_date'       => $start->copy()->addMonths($i),
                    'note'           => 'Pending',
                ]);
            }

            DB::commit();

            ActivityLogger::log(
                'Created Loan',
                "Loan #{$loan->loan_code} created for {$loan->client_name}"
            );

            /** ✉️📱 Send Email & SMS Notifications (KEPT ON as requested) */
            try {
                $customer = $loan->customer;

                if ($customer) {
                    // ✉️ Email notification
                    if (!empty($customer->email)) {
                        Mail::to($customer->email)->send(new LoanCreatedMail($loan));
                        Log::info('📨 LoanCreatedMail sent', [
                            'loan_id' => $loan->id,
                            'email'   => $customer->email,
                        ]);
                    }

                    // 📱 SMS notification
                    if (!empty($customer->phone)) {
                        $msg = "Hi {$customer->full_name}, your loan of ₵" .
                               number_format($loan->amount, 2) .
                               " has been created and activated. Loan Code: {$loan->loan_code}.";
                        SmsNotifier::send($customer->phone, $msg);
                    }
                }
            } catch (\Throwable $notifyEx) {
                Log::warning('⚠️ Loan notification failed', [
                    'loan_id' => $loan->id,
                    'error'   => $notifyEx->getMessage(),
                ]);
            }

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Loan created successfully and marked active.');
        } catch (\Illuminate\Validation\ValidationException $ex) {
            // No transaction yet when validation fails, just return with errors
            return back()
                ->withErrors($ex->validator)
                ->withInput();
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->handleError($e, '⚠️ Loan creation failed. Please try again.');
        }
    }

    /**
     * 💵 Legacy single-payment endpoint (still here if you use it anywhere)
     * NOTE: your main payment logic is now in PaymentController with schedules.
     */
    public function recordPayment(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note'   => 'nullable|string|max:255',
        ]);

        try {
            $loan->payments()->create([
                'amount'         => $validated['amount'],
                'paid_at'        => now(),
                'received_by'    => auth()->id(),
                'payment_method' => 'cash',
                'note'           => $validated['note'] ?? null,
            ]);

            // Update totals
            $loan->refresh();
            $loan->amount_paid      = $loan->payments->sum('amount');
            $loan->amount_remaining = max(0, $loan->total_with_interest - $loan->amount_paid);

            /** 📲 NEW SMS ADDED — Payment made */
            if (!empty($loan->customer->phone)) {
                $sms = "Hi {$loan->customer->full_name}, payment of ₵" .
                       number_format($validated['amount'], 2) .
                       " received for your loan. Remaining balance: ₵" .
                       number_format($loan->amount_remaining, 2);
                SmsNotifier::send($loan->customer->phone, $sms);
            }

            // Check completion
            if ($loan->amount_remaining <= 0) {
                $loan->status = 'paid';
                $loan->save();

                ActivityLogger::log(
                    'Loan Completed',
                    "Loan #{$loan->loan_code} fully repaid by {$loan->client_name}"
                );

                /** ✉️📱 Completion notifications */
                try {
                    $customer = $loan->customer;

                    if ($customer) {
                        // Email
                        if (!empty($customer->email)) {
                            Mail::to($customer->email)->send(new LoanCompletedMail($loan));
                            Log::info('📨 LoanCompletedMail sent', [
                                'loan_id' => $loan->id,
                                'email'   => $customer->email,
                            ]);
                        }

                        // 📲 NEW SMS ADDED — Loan fully paid
                        if (!empty($customer->phone)) {
                            $msg = "🎉 Congratulations {$customer->full_name}! Your loan (Code: {$loan->loan_code}) has been fully paid off. Thank you for trusting Joelaar Micro-Credit.";
                            SmsNotifier::send($customer->phone, $msg);
                        }
                    }
                } catch (\Throwable $ex) {
                    Log::warning('⚠️ Loan completion notification failed', [
                        'loan_id' => $loan->id,
                        'error'   => $ex->getMessage(),
                    ]);
                }
            } else {
                $loan->save();

                ActivityLogger::log(
                    'Recorded Payment',
                    "₵{$validated['amount']} received for Loan #{$loan->loan_code}"
                );
            }

            return back()->with('success', '✅ Payment recorded successfully.');
        } catch (\Throwable $e) {
            Log::error('❌ Payment record failed', [
                'loan_id' => $loan->id ?? 'unknown',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
            ]);

            return back()->with('error', '⚠️ Failed to record payment.');
        }
    }

    /** 👁️ Show loan details */
    public function show(Loan $loan)
    {
        try {
            $loan->load([
                'customer',
                'user',
                'payments.receivedByUser',
                'loanSchedules' => fn($q) => $q->orderBy('payment_number'),
            ]);

            // Re-sync amount_paid & amount_remaining from schedules
            $loan->amount_paid      = $loan->payments->sum('amount');
            $loan->amount_remaining = $loan->loanSchedules->sum('amount_left');

            return Inertia::render('Admin/Loans/Show', [
                'loan' => $loan->fresh([
                    'customer',
                    'user',
                    'payments.receivedByUser',
                    'loanSchedules',
                ]),
                'auth'     => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load loan details.');
        }
    }

    /** 🧰 Central error handler */
    private function handleError(\Throwable $e, string $msg)
    {
        Log::error('❌ LoanController Error', [
            'route' => request()->path(),
            'error' => $e->getMessage(),
            'line'  => $e->getLine(),
            'file'  => $e->getFile(),
        ]);

        return redirect()
            ->route($this->basePath() . '.loans.index')
            ->with('error', $msg);
    }
}