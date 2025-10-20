<?php

namespace App\Observers;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\SmsNotifier; // ✅ Added

class PaymentObserver
{
    /**
     * When a payment is created, distribute it across loan schedules.
     */
    public function created(Payment $payment): void
    {
        $this->applyPayment($payment);
    }

    /**
     * Main logic for applying a payment and updating balances.
     */
    private function applyPayment(Payment $payment): void
    {
        try {
            $loanId = $payment->loan_id;
            $amount = (float) $payment->amount;

            if (!$loanId || $amount <= 0) return;

            // 🔹 Get the loan
            $loan = DB::table('loans')->where('id', $loanId)->first();
            if (!$loan) {
                Log::warning('⚠️ Loan not found for payment', ['payment_id' => $payment->id]);
                return;
            }

            // 🔹 Get all schedules in order
            $schedules = DB::table('loan_schedules')
                ->where('loan_id', $loanId)
                ->orderBy('payment_number')
                ->get();

            $remainingToApply = $amount;

            foreach ($schedules as $schedule) {
                if ($remainingToApply <= 0) break;

                $alreadyPaid = (float) $schedule->amount_paid;
                $totalDueForThis = (float) $schedule->amount;
                $remainingThis = max($totalDueForThis - $alreadyPaid, 0);

                // Skip cleared ones
                if ($remainingThis <= 0.009) continue;

                // Apply portion to this schedule
                $apply = min($remainingToApply, $remainingThis);
                $newPaid = $alreadyPaid + $apply;
                $newRemaining = max($totalDueForThis - $newPaid, 0);

                // Deduct applied from remaining to apply
                $remainingToApply -= $apply;

                // Determine status/note
                $statusNote = $newRemaining <= 0.009
                    ? 'Cleared ✅'
                    : 'Partial — ₵' . number_format($newRemaining, 2) . ' left';

                // Update the schedule
                DB::table('loan_schedules')
                    ->where('id', $schedule->id)
                    ->update([
                        'amount_paid' => round($newPaid, 2),
                        'remaining_amount' => round($newRemaining, 2),
                        'is_paid' => $newRemaining <= 0.009 ? 1 : 0,
                        'note' => $statusNote,
                        'paid_at' => $newRemaining <= 0.009 ? now() : $schedule->paid_at,
                        'updated_at' => now(),
                    ]);
            }

            // 🧮 Update overall loan totals
            $totalPaid = (float) DB::table('payments')->where('loan_id', $loanId)->sum('amount');
            $totalWithInterest = (float) ($loan->amount + ($loan->amount * ($loan->interest_rate ?? 0) / 100));
            $remainingLoan = max($totalWithInterest - $totalPaid, 0);

            // 🔍 Check if all schedules are fully paid
            $pendingCount = DB::table('loan_schedules')
                ->where('loan_id', $loanId)
                ->where('is_paid', 0)
                ->count();

            // Update the loan master record
            DB::table('loans')
                ->where('id', $loanId)
                ->update([
                    'amount_paid' => round($totalPaid, 2),
                    'amount_remaining' => round($remainingLoan, 2),
                    'status' => ($pendingCount === 0 || $remainingLoan <= 0.009) ? 'paid' : 'active',
                    'updated_at' => now(),
                ]);

            // ✅ 📨 SMS Notifications
            $customer = DB::table('customers')->where('id', $loan->customer_id ?? null)->first();
            if ($customer && !empty($customer->phone)) {
                // 🔹 Notify about payment received
                $msg = "Hi {$customer->full_name}, payment of ₵" . number_format($amount, 2) .
                    " received for your loan #{$loanId}. Remaining balance: ₵" . number_format($remainingLoan, 2);
                SmsNotifier::send($customer->phone, $msg);

                // 🔹 Notify if loan fully paid
                if ($remainingLoan <= 0.009) {
                    $msg2 = "🎉 Congratulations {$customer->full_name}! Your loan #{$loanId} has been fully cleared. Thank you for your timely payments!";
                    SmsNotifier::send($customer->phone, $msg2);
                }
            }

            Log::info('✅ Payment distributed successfully', [
                'loan_id' => $loanId,
                'payment_id' => $payment->id,
                'applied_amount' => $amount,
                'remaining_to_apply' => $remainingToApply,
                'remaining_loan_balance' => $remainingLoan,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Payment allocation failed', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id ?? null,
            ]);
        }
    }
}