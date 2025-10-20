<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable()->unique(); // ✅ new email field
            $table->string('address')->nullable();
            $table->enum('marital_status', ['single', 'married'])->nullable();
            $table->enum('gender', ['M', 'F'])->nullable();
            $table->string('house_no')->nullable();
            $table->string('community')->nullable();
            $table->string('location')->nullable();
            $table->string('district')->nullable();
            $table->string('postal_address')->nullable();
            $table->string('workplace')->nullable();
            $table->string('profession')->nullable();
            $table->string('employer')->nullable();
            $table->string('bank')->nullable();
            $table->string('bank_branch')->nullable();
            $table->boolean('has_bank_loan')->default(false);
            $table->decimal('bank_monthly_deduction', 10, 2)->nullable();
            $table->decimal('take_home', 10, 2)->nullable();
            $table->decimal('loan_amount_requested', 10, 2)->nullable();
            $table->string('loan_purpose')->nullable();
            $table->string('agreement_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};