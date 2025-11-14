<?php

namespace App\Observers;

use App\Models\Payment;
use App\Models\Loan;
use App\Models\LoanSchedule;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;
use App\Helpers\SmsNotifier;

class PaymentObserver
{
    /**
     * 🔹 When a payment is created, apply it automatically.
     */
    public function created(Payment $payment): void
    {
        $this->applyPayment($payment);
    }

    /**
     * 🧮 Core logic — distributes payment across schedules + updates loan and customer.
     */
    private function applyPayment(Payment $payment): void
    {
        try {
            $loan = Loan::with(['loanSchedules', 'customer'])->find($payment->loan_id);

            if (!$loan) {
                Log::warning('⚠️ Loan not found for PaymentObserver', ['payment_id' => $payment->id]);
                return;
            }

            $amountRemaining = (float) $payment->amount;
            $schedules = $loan->loanSchedules()->orderBy('payment_number')->get();

            foreach ($schedules as $schedule) {
                if ($amountRemaining <= 0.00) break;

                $remainingForThis = $schedule->amount - $schedule->amount_paid;
                if ($remainingForThis <= 0.01) continue;

                $apply = min($amountRemaining, $remainingForThis);
                $schedule->amount_paid += $apply;
                $schedule->amount_left = max(0, $schedule->amount - $schedule->amount_paid);
                $schedule->is_paid = $schedule->amount_left <= 0.01;
                $schedule->note = $schedule->is_paid
                    ? 'Cleared ✅'
                    : 'Partial — ₵' . number_format($schedule->amount_left, 2) . ' left';
                $schedule->save();

                $amountRemaining -= $apply;
            }

            // 🔁 Recalculate the loan totals and status (auto triggers from LoanSchedule observer)
            $loan->refresh();
            $loan->update([
                'amount_paid' => $loan->loanSchedules()->sum('amount_paid'),
                'amount_remaining' => $loan->loanSchedules()->sum('amount_left'),
            ]);

            // ✅ LoanObserver will update status, expected interest, and customer totals automatically
            $loan->touch();

            // 📨 SMS Notifications
            $customer = $loan->customer;
            if ($customer && !empty($customer->phone)) {
                $remaining = number_format($loan->amount_remaining, 2);
                $msg = "Hi {$customer->full_name}, payment of ₵" . number_format($payment->amount, 2) .
                    " received for your loan #{$loan->id}. Remaining balance: ₵{$remaining}";
                SmsNotifier::send($customer->phone, $msg);

                if ($loan->status === 'paid') {
                    $msg2 = "🎉 Congratulations {$customer->full_name}! Your loan #{$loan->id} has been fully cleared. Thank you for your timely payments!";
                    SmsNotifier::send($customer->phone, $msg2);
                }
            }

            Log::info('✅ PaymentObserver: Payment applied successfully', [
                'payment_id' => $payment->id,
                'loan_id' => $loan->id,
                'applied_amount' => $payment->amount,
                'remaining_balance' => $loan->amount_remaining,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ PaymentObserver: Failed to apply payment', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id ?? null,
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);
        }
    }
}