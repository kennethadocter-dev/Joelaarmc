<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * 🧭 Explicitly register custom Artisan commands.
     */
    protected $commands = [
        \App\Console\Commands\LoansSyncStatus::class, // ✅ Add your custom command here
    ];

    /**
     * 📅 Define your application's command schedule.
     *
     * You can use this method to run tasks automatically:
     *   - schedule backups
     *   - recalculate loans daily
     *   - send reminders, etc.
     *
     * Example:
     *   $schedule->command('loans:sync-status')->dailyAt('00:30');
     */
    protected function schedule(Schedule $schedule): void
    {
        // Example scheduled commands:
        // $schedule->command('loans:sync-status')->dailyAt('00:30');
        // $schedule->command('backup:run')->weekly();
    }

    /**
     * 🧩 Register the commands for the application.
     *
     * This automatically loads all Artisan commands stored in:
     *   app/Console/Commands/
     */
    protected function commands(): void
    {
        // Load all custom Artisan commands
        $this->load(__DIR__ . '/Commands');

        // Optionally, include console routes (if used)
        require base_path('routes/console.php');
    }
}