<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $customers = DB::table('customers')->get();

        foreach ($customers as $customer) {
            $exists = DB::table('users')
                ->where('email', $customer->email)
                ->orWhere('phone', $customer->phone)
                ->first();

            if ($exists) continue;

            DB::table('users')->insert([
                'name'       => $customer->full_name ?? 'Unnamed Customer',
                'email'      => $customer->email,
                'phone'      => $customer->phone,
                'role'       => 'customer',
                'password'   => bcrypt(Str::random(10)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'customer')->delete();
    }
};