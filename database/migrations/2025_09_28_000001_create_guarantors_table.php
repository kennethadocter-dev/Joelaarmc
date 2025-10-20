<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('guarantors', function (Blueprint $table) {
            $table->id();

            // Link each guarantor to a specific loan
            $table->foreignId('loan_id')->constrained()->cascadeOnDelete();

            // (Optional) link to a customer too, if needed for cross-references
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('occupation')->nullable();
            $table->string('residence')->nullable();
            $table->string('contact')->nullable(); // phone number or email
            // Optional: signature image path or scanned document path
            // $table->string('signature_path')->nullable();
            $table->string('email')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guarantors');
    }
};