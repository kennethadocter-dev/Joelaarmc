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
        // Run the SuperAdmin seeder
        $this->call([
            SuperAdminSeeder::class,
        ]);

        $this->command->info('✅ Super Admin seeder executed successfully.');
    }
}