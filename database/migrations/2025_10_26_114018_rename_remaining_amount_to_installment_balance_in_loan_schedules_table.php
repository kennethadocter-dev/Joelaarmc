<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('loan_schedules', 'remaining_amount')) {
                $table->renameColumn('remaining_amount', 'amount_left');
            }
        });
    }

    public function down(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('loan_schedules', 'amount_left')) {
                $table->renameColumn('amount_left', 'remaining_amount');
            }
        });
    }
};