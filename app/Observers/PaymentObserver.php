<?php

namespace App\Observers;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class PaymentObserver
{
    /**
     * 🚫 PAYMENT OBSERVER DISABLED
     * ------------------------------------------------------------
     * IMPORTANT:
     * PaymentController already handles:
     *  - applying payment to schedules
     *  - updating loan totals
     *  - updating loan status
     *  - updating customer totals
     *  - idempotency (duplicate protection)
     *
     * If the observer also applies a payment,
     * the loan will be deducted TWICE.
     *
     * Therefore, the observer is intentionally EMPTY.
     * ------------------------------------------------------------
     */

    public function created(Payment $payment): void
    {
        Log::info('🔕 PaymentObserver skipped: Logic handled in PaymentController', [
            'payment_id' => $payment->id,
            'loan_id'    => $payment->loan_id,
        ]);
    }

    public function updated(Payment $payment): void
    {
        // Intentionally left empty
        Log::info('🔕 PaymentObserver updated skipped');
    }

    public function deleted(Payment $payment): void
    {
        // Intentionally left empty
        Log::info('🔕 PaymentObserver deleted skipped');
    }
}