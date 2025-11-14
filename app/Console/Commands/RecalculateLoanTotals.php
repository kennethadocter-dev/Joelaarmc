<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Loan;
use App\Models\LoanSchedule;
use Illuminate\Support\Facades\DB;

class RecalculateLoanTotals extends Command
{
    protected $signature = 'loans:recalculate';
    protected $description = 'Recalculate amount_paid, amount_remaining, and total_with_interest for all existing loans';

    public function handle()
    {
        $this->info("🔁 Recalculating all loans...");

        $count = 0;
        DB::beginTransaction();

        try {
            $loans = Loan::with('loanSchedules', 'payments')->get();

            foreach ($loans as $loan) {
                $totalFromSchedules = $loan->loanSchedules->sum('amount');
                $remaining = $loan->loanSchedules->sum('amount_left');
                $paid = $loan->payments->sum('amount');

                $loan->update([
                    'total_with_interest' => round($totalFromSchedules, 2),
                    'amount_paid' => round($paid, 2),
                    'amount_remaining' => round($remaining, 2),
                    'status' => $remaining <= 0 ? 'paid' : 'active',
                ]);

                $count++;
            }

            DB::commit();
            $this->info("✅ {$count} loans recalculated successfully!");
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("❌ Error: {$e->getMessage()}");
        }
    }
}