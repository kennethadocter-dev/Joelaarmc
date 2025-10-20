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
        if (Schema::hasTable('payments') && !Schema::hasColumn('payments', 'received_by')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreignId('received_by')
                    ->nullable()
                    ->after('note') // ✅ places column after 'note'
                    ->constrained('users')
                    ->nullOnDelete(); // ✅ same as onDelete('set null')
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('payments') && Schema::hasColumn('payments', 'received_by')) {
            Schema::table('payments', function (Blueprint $table) {
                // Drop foreign key if it exists (important for MySQL)
                $table->dropConstrainedForeignId('received_by');
            });
        }
    }
};