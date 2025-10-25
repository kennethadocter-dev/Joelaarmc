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

    /** 💾 Store a new payment + auto-update schedules + send SMS + email */
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

            /** 💰 Create payment record */
            $payment = Payment::create([
                'loan_id'        => $loan->id,
                'received_by'    => auth()->id(),
                'amount'         => $validated['amount'],
                'paid_at'        => $validated['paid_at'],
                'payment_method' => 'cash',
                'reference'      => $validated['reference'] ?? null,
                'note'           => $validated['note'] ?? null,
            ]);

            $remainingPayment = $validated['amount']; // amount left to distribute

            /** 📅 Apply payment to schedules (oldest unpaid first) */
            $schedules = $loan->loanSchedules()->orderBy('payment_number')->get();

            foreach ($schedules as $schedule) {
                if ($remainingPayment <= 0) break; // done distributing

                $scheduleBalance = $schedule->remaining_amount;

                if ($scheduleBalance > 0) {
                    if ($remainingPayment >= $scheduleBalance) {
                        // Pay off this schedule completely
                        $schedule->amount_paid += $scheduleBalance;
                        $remainingPayment -= $scheduleBalance;
                    } else {
                        // Partial payment
                        $schedule->amount_paid += $remainingPayment;
                        $remainingPayment = 0;
                    }

                    $schedule->save(); // auto-updates remaining_amount + is_paid (from model boot)
                }
            }

            /** 📊 Recalculate loan totals after schedule updates */
            $loan->refresh(); // reload updated relationship

            $loan->amount_paid = $loan->loanSchedules()->sum('amount_paid');
            $loan->amount_remaining = $loan->loanSchedules()->sum('remaining_amount');
            $loan->interest_earned = max(0, $loan->amount_paid - $loan->amount);
            $loan->status = $loan->amount_remaining <= 0.01 ? 'paid' : 'active';
            $loan->save();

            DB::commit();

            /** 📱 SMS Update */
            if (!empty($loan->customer?->phone)) {
                $msg = "Hi {$loan->customer->full_name}, we've received your payment of ₵" .
                    number_format($validated['amount'], 2) .
                    ". Remaining balance: ₵" . number_format($loan->amount_remaining, 2) .
                    ". Thank you!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            /** 🎉 If loan fully paid, trigger notifications */
            if ($loan->status === 'paid') {
                ActivityLogger::log('Completed Loan', "Loan #{$loan->id} marked as fully paid automatically.");

                // 📨 Email
                if (!empty($loan->customer?->email)) {
                    Mail::to($loan->customer->email)->send(new LoanCompletedMail($loan));
                }

                // 📱 SMS
                if (!empty($loan->customer?->phone)) {
                    $msg = "🎉 Congratulations {$loan->customer->full_name}! Your loan of ₵" .
                        number_format($loan->amount, 2) .
                        " is now fully paid off. Thank you for being a valued Joelaar customer!";
                    SmsNotifier::send($loan->customer->phone, $msg);
                }
            }

            ActivityLogger::log('Created Payment', "Payment of ₵{$validated['amount']} recorded for loan #{$loan->id}");

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Payment recorded and schedules updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->handleError($e, '⚠️ Failed to record payment.');
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

    /** 🧰 Unified error handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ PaymentController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.loans.index')
            ->with('error', $message);
    }
}