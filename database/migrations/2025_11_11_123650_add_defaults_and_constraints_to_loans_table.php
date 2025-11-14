<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            // ✅ Set sensible defaults
            $table->decimal('amount', 12, 2)->default(0)->change();
            $table->decimal('expected_interest', 12, 2)->default(0)->nullable()->change();
            $table->decimal('interest_rate', 5, 2)->default(35)->nullable()->change();
            $table->integer('term_months')->default(1)->nullable()->change();
            $table->string('status', 50)->default('active')->nullable()->change();
            $table->decimal('amount_paid', 12, 2)->default(0)->nullable()->change();
            $table->decimal('amount_remaining', 12, 2)->default(0)->nullable()->change();
            $table->decimal('interest_earned', 12, 2)->default(0)->nullable()->change();
            $table->decimal('total_with_interest', 12, 2)->default(0)->nullable()->change();
        });

        // ✅ Normalize existing data immediately
        DB::statement("UPDATE loans SET status = LOWER(TRIM(COALESCE(status, 'active')))");
        DB::statement("UPDATE loans SET expected_interest = COALESCE(expected_interest, 0)");
        DB::statement("UPDATE loans SET amount_remaining = COALESCE(amount_remaining, 0)");
        DB::statement("UPDATE loans SET amount_paid = COALESCE(amount_paid, 0)");
        DB::statement("UPDATE loans SET interest_earned = COALESCE(interest_earned, 0)");
        DB::statement("UPDATE loans SET total_with_interest = COALESCE(total_with_interest, amount + expected_interest)");
    }

    public function down(): void
    {
        // We won't strictly revert defaults, just leave schema as-is
        Schema::table('loans', function (Blueprint $table) {
            // No rollback needed for defaults
        });
    }
};