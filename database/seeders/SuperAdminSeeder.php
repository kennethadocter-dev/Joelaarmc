<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ✅ Always ensure we have a main superadmin
        User::updateOrCreate(
            ['email' => 'super@admin.com'], // unique identifier
            [
                'name'           => 'Super Admin',
                'password'       => Hash::make('123456789'), // 🔑 default password
                'role'           => 'superadmin',
                'is_super_admin' => true, // ✅ explicit flag
            ]
        );
    }
}