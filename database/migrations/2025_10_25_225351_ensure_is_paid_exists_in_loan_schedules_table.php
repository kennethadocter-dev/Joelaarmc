<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            // ✅ Add is_paid if missing
            if (!Schema::hasColumn('loan_schedules', 'is_paid')) {
                $table->boolean('is_paid')->default(false)->after('due_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('loan_schedules', 'is_paid')) {
                $table->dropColumn('is_paid');
            }
        });
    }
};