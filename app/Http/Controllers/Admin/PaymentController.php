<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Loan;
use App\Models\LoanSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoanCompletedMail;
use App\Helpers\ActivityLogger;
use App\Helpers\SmsNotifier;

class PaymentController extends Controller
{
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** 📋 List all payments */
    public function index(Request $request)
    {
        try {
            $query = Payment::with(['loan.customer', 'receivedByUser'])
                ->orderByDesc('paid_at');

            if ($request->filled('client')) {
                $query->whereHas('loan.customer', function ($q) use ($request) {
                    $q->where('full_name', 'like', '%' . $request->client . '%');
                });
            }

            $payments = $query->get();

            return Inertia::render('Admin/Payments/Index', [
                'payments' => $payments,
                'auth'     => ['user' => auth()->user()],
                'flash'    => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load payment list.');
        }
    }

    /** 📝 Create new payment form */
    public function create(Request $request)
    {
        try {
            $loanId = $request->query('loan_id');
            $loan = Loan::with('customer')->find($loanId);

            if (!$loan) {
                return redirect()->route($this->basePath() . '.loans.index')
                    ->with('error', '⚠️ Please select a valid loan first.');
            }

            return Inertia::render('Admin/Payments/Create', [
                'loan' => $loan,
                'auth' => ['user' => auth()->user()],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to open payment form.');
        }
    }

    /** 💾 Store a new payment + update monthly schedules + notify */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'loan_id'   => 'required|exists:loans,id',
                'amount'    => 'required|numeric|min:1',
                'paid_at'   => 'required|date',
                'reference' => 'nullable|string|max:255',
                'note'      => 'nullable|string|max:500',
            ]);

            $loan = Loan::with(['customer', 'loanSchedules'])->findOrFail($validated['loan_id']);
            DB::beginTransaction();

            /** 💰 Record payment */
            $payment = Payment::create([
                'loan_id'        => $loan->id,
                'received_by'    => auth()->id(),
                'amount'         => $validated['amount'],
                'paid_at'        => $validated['paid_at'],
                'payment_method' => 'cash',
                'reference'      => $validated['reference'] ?? null,
                'note'           => $validated['note'] ?? null,
            ]);

            /** 📅 Distribute payment across monthly schedule */
            $remainingPayment = $validated['amount'];
            $schedules = $loan->loanSchedules()->orderBy('payment_number')->get();

            foreach ($schedules as $schedule) {
                if ($remainingPayment <= 0) break;

                $balance = $schedule->amount_left ?? ($schedule->amount - $schedule->amount_paid);

                if ($balance > 0) {
                    if ($remainingPayment >= $balance) {
                        $schedule->amount_paid += $balance;
                        $remainingPayment -= $balance;
                    } else {
                        $schedule->amount_paid += $remainingPayment;
                        $remainingPayment = 0;
                    }

                    $schedule->amount_left = max(0, $schedule->amount - $schedule->amount_paid);
                    $schedule->is_paid = $schedule->amount_left <= 0.01;
                    $schedule->note = $schedule->is_paid
                        ? 'Fully paid'
                        : ($schedule->amount_paid > 0 ? 'Partially paid' : 'Pending');

                    $schedule->save();
                }
            }

            /** 🔁 Update totals */
            $loan->refresh();
            $loan->amount_paid = $loan->loanSchedules()->sum('amount_paid');
            $loan->amount_remaining = $loan->loanSchedules()->sum('amount_left');
            $loan->status = $loan->amount_remaining <= 0.01 ? 'paid' : 'active';
            $loan->save();

            DB::commit();

            /** ✅ RELOAD RELATIONSHIPS FOR FRONTEND */
            $loan->load([
                'customer',
                'payments' => fn($q) => $q->orderByDesc('paid_at'),
                'loanSchedules' => fn($q) => $q->orderBy('payment_number'),
            ]);

            /** 📨 Send SMS + Email Notifications */
            if (!empty($loan->customer?->phone)) {
                $msg = "Hi {$loan->customer->full_name}, we've received your payment of ₵" .
                    number_format($validated['amount'], 2) .
                    ". Remaining balance: ₵" . number_format($loan->amount_remaining, 2) .
                    ". Thank you for your payment!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            if ($loan->status === 'paid') {
                ActivityLogger::log('Completed Loan', "Loan #{$loan->id} marked fully paid.");
                if (!empty($loan->customer?->email)) {
                    Mail::to($loan->customer->email)->send(new LoanCompletedMail($loan));
                }
            }

            ActivityLogger::log('Created Payment', "₵{$validated['amount']} recorded for loan #{$loan->id}");

            /** 🧭 Return updated page directly — no redirect */
            return Inertia::render('Admin/Loans/Show', [
                'loan' => $loan,
                'auth' => ['user' => auth()->user()],
                'flash' => [
                    'success' => '✅ Payment recorded successfully and table updated.',
                ],
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('❌ PaymentController Error', ['error' => $e->getMessage()]);
            return redirect()
                ->route($this->basePath() . '.loans.index')
                ->with('error', '⚠️ Failed to record payment.');
        }
    }

    /** 🧾 Show payment details */
    public function show(Payment $payment)
    {
        try {
            $payment->load(['loan.customer', 'receivedByUser']);
            return Inertia::render('Admin/Payments/Show', [
                'payment' => $payment,
                'auth' => ['user' => auth()->user()],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load payment details.');
        }
    }

    /** 🧰 Centralized error handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ PaymentController Error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return redirect()
            ->route($this->basePath() . '.loans.index')
            ->with('error', $message);
    }
}