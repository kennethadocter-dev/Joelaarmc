<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Loan;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class RecalculateLoans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * You can run:
     *   php artisan loans:recalculate
     * or
     *   php artisan loans:recalculate --loan_id=5
     */
    protected $signature = 'loans:recalculate 
                            {--loan_id= : Recalculate a single loan ID (optional)}';

    /**
     * The console command description.
     */
    protected $description = 'Recalculate and fix totals for only mismatched loans, syncing payments and schedules.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $loanId = $this->option('loan_id');

        $query = $loanId
            ? Loan::where('id', $loanId)
            : Loan::query();

        $loans = $query->with(['loanSchedules', 'customer'])->get();

        if ($loans->isEmpty()) {
            $this->warn('⚠️ No loans found.');
            return Command::SUCCESS;
        }

        $fixedCount = 0;
        $this->info("🔍 Checking {$loans->count()} loan(s) for inconsistencies...");

        foreach ($loans as $loan) {
            $expectedPaid = Payment::where('loan_id', $loan->id)->sum('amount');
            $schedulePaid = $loan->loanSchedules->sum('amount_paid');
            $scheduleLeft = $loan->loanSchedules->sum('amount_left');

            // Detect mismatch
            $needsFix = abs($expectedPaid - $schedulePaid) > 0.01
                || $loan->amount_paid != $schedulePaid
                || $loan->amount_remaining != $scheduleLeft;

            if (!$needsFix) {
                $this->line("✔️ Loan #{$loan->id} ({$loan->client_name}) already correct.");
                continue;
            }

            DB::beginTransaction();
            try {
                $remaining = $expectedPaid;
                $schedules = $loan->loanSchedules()->orderBy('payment_number')->get();

                foreach ($schedules as $s) {
                    if ($remaining <= 0) {
                        $s->amount_paid = 0;
                        $s->amount_left = $s->amount;
                        $s->is_paid = false;
                        $s->note = 'Pending';
                        $s->save();
                        continue;
                    }

                    $balance = $s->amount_left ?? ($s->amount - $s->amount_paid);
                    if ($remaining >= $s->amount) {
                        $s->amount_paid = $s->amount;
                        $s->amount_left = 0;
                        $remaining -= $s->amount;
                        $s->is_paid = true;
                        $s->note = 'Fully paid';
                    } else {
                        $s->amount_paid = $remaining;
                        $s->amount_left = max(0, $s->amount - $remaining);
                        $remaining = 0;
                        $s->is_paid = false;
                        $s->note = 'Partially paid';
                    }
                    $s->save();
                }

                // Recalculate loan totals
                $loan->amount_paid = $loan->loanSchedules()->sum('amount_paid');
                $loan->amount_remaining = $loan->loanSchedules()->sum('amount_left');

                if ($loan->amount_remaining <= 0.01) {
                    $loan->status = 'paid';
                } elseif ($loan->amount_paid > 0) {
                    $loan->status = 'active';
                } else {
                    $loan->status = 'pending';
                }

                $loan->save();

                DB::commit();
                $fixedCount++;

                $this->info("✅ Fixed Loan #{$loan->id} ({$loan->client_name}): ₵{$loan->amount_paid} paid, ₵{$loan->amount_remaining} left, status: {$loan->status}");
            } catch (\Throwable $e) {
                DB::rollBack();
                $this->error("❌ Failed to fix Loan #{$loan->id}: " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info("🎯 Recalculation finished. {$fixedCount} loan(s) updated successfully.");

        return Command::SUCCESS;
    }
}