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
            // Auto-calculate expected interest & totals
            $loan->expected_interest = $loan->calculateExpectedInterest();
            $loan->total_with_interest = $loan->calculateTotalWithInterest();
            $loan->status = $loan->status ?? 'active';
            $loan->saveQuietly();

            // Update related customer
            if ($loan->customer) {
                $loan->customer->refreshLoanSummary($loan->customer);
            }

            Log::info('✅ Loan created and recalculated', [
                'loan_id' => $loan->id,
                'client' => $loan->client_name,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ LoanObserver (created) failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 🔄 When a loan is updated
     */
    public function updated(Loan $loan): void
    {
        try {
            $loan->recalculateSummary();

            if ($loan->customer) {
                $loan->customer->refreshLoanSummary($loan->customer);
            }

            Log::info('🔁 Loan updated and recalculated', ['loan_id' => $loan->id]);
        } catch (\Throwable $e) {
            Log::error('❌ LoanObserver (updated) failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 🗑️ When a loan is deleted
     */
    public function deleted(Loan $loan): void
    {
        try {
            if ($loan->customer) {
                $loan->customer->refreshLoanSummary($loan->customer);
            }

            Log::info('🗑️ Loan deleted', ['loan_id' => $loan->id]);
        } catch (\Throwable $e) {
            Log::error('❌ LoanObserver (deleted) failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}