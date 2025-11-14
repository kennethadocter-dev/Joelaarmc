<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SendWeeklyLoanSummary; // ✅ Weekly summary job

class Kernel extends ConsoleKernel
{
    /**
     * 🧭 Explicitly register custom Artisan commands.
     *
     * Here you define custom Artisan command classes
     * that should be discoverable by the framework.
     */
    protected $commands = [
        \App\Console\Commands\SyncLoansCommand::class,     // ✅ Existing command
        \App\Console\Commands\PurgeOldCustomers::class,    // 🧹 Auto-purge old customers
    ];

    /**
     * 📅 Define your application's command schedule.
     *
     * This method runs automatically by Laravel's scheduler
     * (e.g., via `php artisan schedule:run` in cron).
     */
    protected function schedule(Schedule $schedule): void
    {
        // 🕐 Daily: Resync loan data silently at 1:00 AM
        $schedule->command('loans:resync --silent')
            ->dailyAt('01:00')
            ->withoutOverlapping()
            ->onOneServer();

        // 🧹 Daily: Purge soft-deleted customers older than 30 days at midnight
        $schedule->command('customers:purge-old')
            ->dailyAt('00:00')
            ->withoutOverlapping()
            ->onOneServer();

        // 🗓️ Weekly: Send Loan Summary Email every Sunday at 7:00 AM
        $schedule->job(new SendWeeklyLoanSummary())
            ->weeklyOn(0, '07:00')
            ->onOneServer();

        // 💡 Example (optional): Additional scheduled tasks
        // $schedule->command('backup:run')->weeklyOn(7, '02:00');
        // $schedule->command('telescope:prune')->daily();
    }

    /**
     * 🧩 Register the commands for the application.
     *
     * Automatically loads all Artisan command classes in
     * app/Console/Commands and routes/console.php.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}