<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->decimal('total_loans', 12, 2)->default(0)->after('notes');
            $table->decimal('total_paid', 12, 2)->default(0)->after('total_loans');
            $table->decimal('total_remaining', 12, 2)->default(0)->after('total_paid');
            $table->integer('active_loans_count')->default(0)->after('total_remaining');
            $table->timestamp('last_loan_date')->nullable()->after('active_loans_count');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'total_loans',
                'total_paid',
                'total_remaining',
                'active_loans_count',
                'last_loan_date',
            ]);
        });
    }
};