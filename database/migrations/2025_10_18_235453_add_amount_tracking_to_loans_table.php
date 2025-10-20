<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            if (!Schema::hasColumn('loans', 'amount_paid')) {
                $table->decimal('amount_paid', 12, 2)->default(0);
            }
            if (!Schema::hasColumn('loans', 'amount_remaining')) {
                $table->decimal('amount_remaining', 12, 2)->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            if (Schema::hasColumn('loans', 'amount_paid')) {
                $table->dropColumn('amount_paid');
            }
            if (Schema::hasColumn('loans', 'amount_remaining')) {
                $table->dropColumn('amount_remaining');
            }
        });
    }
};