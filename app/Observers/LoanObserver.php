<?php

namespace App\Observers;

use App\Models\Loan;
use Illuminate\Support\Facades\Log;

class LoanObserver
{
    /**
     * 🚀 When a loan is created
     */
    public function created(Loan $loan): void
    {
        try {
            // Auto-calculate expected interest & totals (if your model supports this)
            if (method_exists($loan, 'calculateExpectedInterest')) {
                $loan->expected_interest = $loan->calculateExpectedInterest();
            }

            if (method_exists($loan, 'calculateTotalWithInterest')) {
                $loan->total_with_interest = $loan->calculateTotalWithInterest();
            }

            $loan->status = $loan->status ?? 'active';
            $loan->saveQuietly();

            // Update related customer
            if ($loan->customer && method_exists($loan->customer, 'refreshLoanSummary')) {
                $loan->customer->refreshLoanSummary();
            }

            Log::info('✅ Loan created and recalculated', [
                'loan_id' => $loan->id,
                'client'  => $loan->client_name,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ LoanObserver (created) failed', [
                'loan_id' => $loan->id ?? null,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    /**
     * 🔄 When a loan is updated
     */
    public function updated(Loan $loan): void
    {
        try {
            // If your Loan model has its own summarizer, use it
            if (method_exists($loan, 'recalculateSummary')) {
                $loan->recalculateSummary();
            }

            if ($loan->customer && method_exists($loan->customer, 'refreshLoanSummary')) {
                $loan->customer->refreshLoanSummary();
            }

            Log::info('🔁 Loan updated and recalculated', [
                'loan_id' => $loan->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ LoanObserver (updated) failed', [
                'loan_id' => $loan->id ?? null,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    /**
     * 🗑️ When a loan is deleted
     */
    public function deleted(Loan $loan): void
    {
        try {
            if ($loan->customer && method_exists($loan->customer, 'refreshLoanSummary')) {
                $loan->customer->refreshLoanSummary();
            }

            Log::info('🗑️ Loan deleted', [
                'loan_id'     => $loan->id,
                'customer_id' => $loan->customer_id,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ LoanObserver (deleted) failed', [
                'loan_id' => $loan->id ?? null,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}