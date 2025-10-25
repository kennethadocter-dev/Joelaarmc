<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations safely.
     */
    public function up(): void
    {
        // 🧠 Only create the table if it doesn't already exist
        if (!Schema::hasTable('sms_logs')) {
            Schema::create('sms_logs', function (Blueprint $table) {
                $table->id();
                $table->string('phone');
                $table->text('message');
                $table->string('status')->default('queued');
                $table->text('error')->nullable();
                $table->timestamps();
            });

            echo "✅ sms_logs table created successfully.\n";
        } else {
            echo "⚠️ sms_logs table already exists — skipped.\n";
        }
    }

    /**
     * Reverse the migrations safely.
     */
    public function down(): void
    {
        if (Schema::hasTable('sms_logs')) {
            Schema::dropIfExists('sms_logs');
            echo "🗑️ sms_logs table dropped.\n";
        } else {
            echo "ℹ️ sms_logs table does not exist — nothing to drop.\n";
        }
    }
};