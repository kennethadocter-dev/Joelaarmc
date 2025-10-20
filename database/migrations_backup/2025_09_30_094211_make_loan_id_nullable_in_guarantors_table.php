<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            // Drop the old foreign key first (only if it exists)
            $table->dropForeign(['loan_id']);

            // Then make the column nullable and re-add the constraint
            $table->foreignId('loan_id')->nullable()->change();

            $table->foreign('loan_id')
                ->references('id')
                ->on('loans')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            // Drop the modified foreign key
            $table->dropForeign(['loan_id']);

            // Revert it back to NOT NULL
            $table->foreignId('loan_id')->nullable(false)->change();

            $table->foreign('loan_id')
                ->references('id')
                ->on('loans')
                ->cascadeOnDelete();
        });
    }
};