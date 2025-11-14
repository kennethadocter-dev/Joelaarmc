<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\LoanSchedule;
use Illuminate\Support\Facades\Log;

class SyncLoansCommand extends Command
{
    protected $signature = 'loans:resync {--silent : Hide console output (for cron use)}';
    protected $description = 'Recalculate all loans, schedules and totals for consistency.';

    public function handle()
    {
        $silent = $this->option('silent');
        $count = 0;
        $start = now();

        DB::transaction(function () use (&$count, $silent) {
            $loans = Loan::all();

            foreach ($loans as $loan) {
                $amount = (float)$loan->amount;
                $rate = (float)$loan->interest_rate;
                $term = (int)$loan->term_months;

                $interestTotal = round($amount * ($rate / 100) * $term, 2);
                $totalWithInterest = $amount + $interestTotal;

                $totalPaid = Payment::where('loan_id', $loan->id)->sum('amount');
                $scheduleRemaining = LoanSchedule::where('loan_id', $loan->id)->sum('amount_left');

                // rebuild schedule if missing or zero
                if ($scheduleRemaining == 0 && $totalPaid < $totalWithInterest) {
                    LoanSchedule::where('loan_id', $loan->id)->delete();
                    $monthly = round($totalWithInterest / max($term, 1), 2);
                    $sum = 0;
                    for ($i = 1; $i <= $term; $i++) {
                        $val = ($i < $term)
                            ? $monthly
                            : round($totalWithInterest - $sum, 2);
                        $sum += $val;

                        LoanSchedule::create([
                            'loan_id' => $loan->id,
                            'payment_number' => $i,
                            'amount' => $val,
                            'amount_paid' => 0.00,
                            'amount_left' => $val,
                            'is_paid' => false,
                            'due_date' => Carbon::parse($loan->start_date)->addMonths($i),
                            'note' => 'Auto-synced',
                        ]);
                    }
                    $scheduleRemaining = $totalWithInterest;
                }

                // status logic
                $status = 'pending';
                if ($totalPaid > 0 && $totalPaid < $totalWithInterest) {
                    $status = 'active';
                } elseif ($totalPaid >= $totalWithInterest) {
                    $status = 'paid';
                }

                $loan->update([
                    'interest_earned' => $interestTotal,
                    'total_with_interest' => $totalWithInterest,
                    'amount_paid' => $totalPaid,
                    'amount_remaining' => max($totalWithInterest - $totalPaid, 0),
                    'status' => $status,
                    'updated_at' => now(),
                ]);

                // update schedules paid flags
                foreach ($loan->loanSchedules as $s) {
                    $s->update(['is_paid' => $s->amount_left <= 0.01]);
                }

                $count++;
                if (!$silent) {
                    $this->info("✅ Synced Loan #{$loan->id} ({$loan->client_name})");
                }
            }
        });

        $duration = now()->diffInSeconds($start);
        $msg = "✅ Synced {$count} loans successfully in {$duration}s.";
        if (!$silent) {
            $this->info($msg);
        }
        Log::info($msg);
    }
}