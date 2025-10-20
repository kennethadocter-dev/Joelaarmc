<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('email_failures', function (Blueprint $table) {
            $table->id();
            $table->string('recipient')->nullable();
            $table->string('subject')->nullable();
            $table->string('loan_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_failures');
    }
};