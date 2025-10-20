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
        Schema::table('loans', function (Blueprint $table) {
            // ✅ Add customer_id only if it doesn't exist already
            if (!Schema::hasColumn('loans', 'customer_id')) {
                $table->foreignId('customer_id')
                      ->nullable()
                      ->constrained() // assumes there is a "customers" table with "id"
                      ->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            if (Schema::hasColumn('loans', 'customer_id')) {
                // drop foreign key before dropping column
                $table->dropForeign(['customer_id']);
                $table->dropColumn('customer_id');
            }
        });
    }
};