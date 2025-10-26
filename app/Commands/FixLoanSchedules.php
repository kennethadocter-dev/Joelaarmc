<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LoanSchedule;

class FixLoanSchedules extends Command
{
    protected $signature = 'loans:fix-schedules';
    protected $description = 'Recalculate and populate amount_left for all loan schedules';

    public function handle()
    {
        $this->info("🔄 Fixing loan schedules...");
        $count = 0;

        LoanSchedule::chunk(100, function ($schedules) use (&$count) {
            foreach ($schedules as $schedule) {
                $schedule->amount_left = max(0, $schedule->amount - $schedule->amount_paid);
                $schedule->is_paid = $schedule->amount_left <= 0.01;
                $schedule->save();
                $count++;
            }
        });

        $this->info("✅ Updated {$count} loan schedules successfully.");
        return Command::SUCCESS;
    }
}