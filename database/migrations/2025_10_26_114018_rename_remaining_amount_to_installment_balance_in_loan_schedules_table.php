<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            $table->renameColumn('remaining_amount', 'installment_balance');
        });
    }

    public function down(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            $table->renameColumn('installment_balance', 'remaining_amount');
        });
    }
};