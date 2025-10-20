<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (!Schema::hasColumn('loan_schedules', 'note')) {
                $table->text('note')->nullable()->after('is_paid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('loan_schedules', 'note')) {
                $table->dropColumn('note');
            }
        });
    }
};