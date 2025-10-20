<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();

            // 📌 Link to the staff/admin who created the loan
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // 📌 Link to the customer (borrower)
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();

            // 👤 Client name (redundant storage for easier reporting)
            $table->string('client_name')->nullable();

            // 💰 Loan details
            $table->decimal('amount', 12, 2);                 // principal amount
            $table->decimal('interest_rate', 5, 2)->default(20.00); // percentage
            $table->integer('term_months')->default(1);       // 1–6 months
            $table->date('start_date');
            $table->date('due_date')->nullable();

            // 📊 Status tracking
            $table->enum('status', ['pending', 'active', 'overdue', 'paid'])->default('pending');
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('amount_remaining', 12, 2)->nullable();

            // 📅 Loan activation timestamp
            $table->timestamp('disbursed_at')->nullable();

            // 💵 Interest actually earned (only updated once loan is fully paid)
            $table->decimal('interest_earned', 12, 2)->default(0);

            // 📝 Optional description
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};