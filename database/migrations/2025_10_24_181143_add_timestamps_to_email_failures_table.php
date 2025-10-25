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
        Schema::table('email_failures', function (Blueprint $table) {
            if (!Schema::hasColumn('email_failures', 'created_at')) {
                $table->timestamps();
            }
        });
    }

public function down(): void
    {
        Schema::table('email_failures', function (Blueprint $table) {
            if (Schema::hasColumn('email_failures', 'created_at')) {
                $table->dropColumn(['created_at', 'updated_at']);
            }
        });
    }
};
