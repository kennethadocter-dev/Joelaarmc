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
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();

            // 📱 Recipient phone number (indexed for faster lookups)
            $table->string('phone')->index();

            // 📨 Actual message text
            $table->text('message');

            // ✅ 'sent' or 'failed'
            $table->string('status', 20)->default('sent')->index();

            // ⚠️ Optional error message if failed
            $table->text('error')->nullable();

            // 🕒 Created / updated timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sms_logs');
    }
};