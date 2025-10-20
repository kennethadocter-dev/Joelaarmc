<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (!Schema::hasColumn('loan_schedules', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('amount');
            }

            if (!Schema::hasColumn('loan_schedules', 'remaining_amount')) {
                $table->decimal('remaining_amount', 10, 2)->default(0)->after('amount_paid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('loan_schedules', 'amount_paid')) {
                $table->dropColumn('amount_paid');
            }
            if (Schema::hasColumn('loan_schedules', 'remaining_amount')) {
                $table->dropColumn('remaining_amount');
            }
        });
    }
};