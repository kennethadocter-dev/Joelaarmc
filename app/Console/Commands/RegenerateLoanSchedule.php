<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Loan;
use App\Models\LoanSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RegenerateLoanSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Usage: php artisan loan:generate-schedule {loan_id}
     */
    protected $signature = 'loan:generate-schedule {loan_id}';

    /**
     * The console command description.
     */
    protected $description = '🔁 Rebuilds a missing repayment schedule for a given loan ID';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $loanId = $this->argument('loan_id');
        $loan = Loan::find($loanId);

        if (!$loan) {
            $this->error("❌ Loan with ID {$loanId} not found.");
            return Command::FAILURE;
        }

        // Safety check
        if ($loan->loanSchedules()->exists()) {
            if (!$this->confirm('⚠️ This loan already has a schedule. Do you want to delete and recreate it?')) {
                $this->info('❎ Operation cancelled.');
                return Command::SUCCESS;
            }

            $loan->loanSchedules()->delete();
        }

        DB::beginTransaction();
        try {
            $this->info("🔧 Rebuilding schedule for loan ID: {$loan->id}");
            $term = $loan->term_months;
            $amount = (float) $loan->amount;
            $rate = (float) $loan->interest_rate;

            // Your interest multipliers
            $multipliers = [
                1 => 1.20,
                2 => 1.31,
                3 => 1.425,
                4 => 1.56,
                5 => 1.67,
                6 => 1.83,
            ];

            $multiplier = $multipliers[$term] ?? (1 + $rate / 100);
            $totalDue = $amount * $multiplier;
            $monthly = round($totalDue / $term, 2);

            for ($i = 1; $i <= $term; $i++) {
                LoanSchedule::create([
                    'loan_id' => $loan->id,
                    'payment_number' => $i,
                    'amount' => $monthly,
                    'due_date' => Carbon::parse($loan->start_date)->addMonths($i),
                    'is_paid' => false,
                ]);
            }

            DB::commit();
            $this->info("✅ Schedule created successfully for {$loan->client_name} ({$term} months).");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("❌ Error: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}