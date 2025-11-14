<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncCustomersToUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * You’ll run it as: php artisan sync:customers
     */
    protected $signature = 'sync:customers';

    /**
     * The console command description.
     */
    protected $description = 'Sync all customers into the users table with role=customer';

    public function handle()
    {
        $this->info("🔄 Starting customer-to-user sync...");

        $customers = DB::table('customers')->get();
        $synced = 0;

        foreach ($customers as $customer) {
            $exists = DB::table('users')
                ->where('email', $customer->email)
                ->orWhere('phone', $customer->phone)
                ->first();

            if ($exists) {
                $this->line("⚠️  Skipped existing user: {$customer->full_name}");
                continue;
            }

            DB::table('users')->insert([
                'name'       => $customer->full_name ?? 'Unnamed Customer',
                'email'      => $customer->email,
                'phone'      => $customer->phone,
                'role'       => 'customer',
                'password'   => bcrypt(Str::random(10)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->line("✅ Synced: {$customer->full_name}");
            $synced++;
        }

        $this->info("\n🎉 Sync complete! {$synced} new users added.");
        return Command::SUCCESS;
    }
}