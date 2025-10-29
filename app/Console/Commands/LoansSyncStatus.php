<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Loan;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoansSyncStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Usage:
     *   php artisan loans:sync-status
     *
     * @var string
     */
    protected $signature = 'loans:sync-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '🔁 Recalculate and synchronize all loan statuses, totals, and payment schedules accurately.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting full loan status synchronization...');

        $count = 0;
        $updated = 0;

        // Fetch all loans with schedules for recalculation
        $loans = Loan::with(['loanSchedules', 'payments', 'customer'])->get();

        if ($loans->isEmpty()) {
            $this->warn('⚠️ No loans found to process.');
            return Command::SUCCESS;
        }

        foreach ($loans as $loan) {
            $count++;

            // Aggregate schedule payment data
            $totals = DB::table('loan_schedules')
                ->selectRaw('SUM(amount_paid) as total_paid, SUM(amount_left) as total_left')
                ->where('loan_id', $loan->id)
                ->first();

            $loan->amount_paid = (float) ($totals->total_paid ?? 0);
            $loan->amount_remaining = max((float) ($totals->total_left ?? 0), 0);
            $loan->interest_earned = max(0, $loan->amount_paid - $loan->amount);

            // Calculate total amount due (principal + interest)
            $totalDue = (float) $loan->amount + (($loan->amount * $loan->interest_rate) / 100);

            // Check schedule and payment status
            $totalSchedules = $loan->loanSchedules->count();
            $paidSchedules = $loan->loanSchedules->where('is_paid', true)->count();
            $hasPayments = $loan->payments()->exists();

            // 🧮 Determine correct status
            if (
                $hasPayments &&
                $totalSchedules > 0 &&
                $paidSchedules === $totalSchedules &&
                abs($loan->amount_paid - $totalDue) < 0.01
            ) {
                $loan->status = 'paid';
            } elseif ($loan->status === 'pending' && !$hasPayments) {
                // Still pending until first payment
            } else {
                // Determine overdue vs active
                $dueDate = $loan->due_date
                    ? Carbon::parse($loan->due_date)
                    : ($loan->start_date
                        ? Carbon::parse($loan->start_date)->addMonths($loan->term_months)
                        : null);

                if ($dueDate && now()->greaterThan($dueDate) && $loan->status !== 'paid') {
                    $loan->status = 'overdue';
                } else {
                    $loan->status = 'active';
                }
            }

            $loan->save();
            $updated++;
        }

        $this->info("✅ Sync complete: {$updated} loans recalculated successfully (out of {$count}).");

        return Command::SUCCESS;
    }
}