<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('manager_name')->nullable();
            $table->string('manager_title')->nullable();
            $table->decimal('default_interest_rate', 5, 2)->default(20);
            $table->integer('default_term_months')->default(3);
            $table->decimal('default_penalty_rate', 5, 2)->default(0.5);
            $table->integer('grace_period_days')->default(0);
            $table->boolean('allow_early_repayment')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};