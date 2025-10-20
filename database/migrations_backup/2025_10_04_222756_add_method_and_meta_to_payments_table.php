<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // ✅ How the payment was made (manual, cash, bank_auto, transfer, card, momo…)
            $table->string('payment_method', 30)->default('manual')->after('amount');

            // (optional) future-friendly columns if you later integrate Stripe/Flutterwave
            $table->string('processor')->nullable()->after('payment_method'); // e.g., 'stripe'
            $table->json('meta')->nullable()->after('processor');             // e.g., gateway response
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'processor', 'meta']);
        });
    }
};