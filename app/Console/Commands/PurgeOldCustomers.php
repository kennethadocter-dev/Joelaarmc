<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use Carbon\Carbon;

class PurgeOldCustomers extends Command
{
    protected $signature = 'customers:purge-old';
    protected $description = 'Permanently delete customers soft-deleted for more than 30 days';

    public function handle()
    {
        $cutoff = Carbon::now()->subDays(30);

        $customers = Customer::onlyTrashed()
            ->where('deleted_at', '<=', $cutoff)
            ->get();

        $count = 0;

        foreach ($customers as $customer) {
            // Permanently delete related loans first (if soft deleted)
            if (method_exists($customer, 'loans')) {
                $customer->loans()->onlyTrashed()->forceDelete();
            }

            // Now permanently delete customer
            $customer->forceDelete();
            $count++;
        }

        $this->info("✅ Purged {$count} customers soft-deleted for over 30 days.");

        return Command::SUCCESS;
    }
}