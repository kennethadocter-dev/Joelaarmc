<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ✅ Always create / update the superadmin account
        $this->call([
            SuperAdminSeeder::class,
        ]);
    }
}