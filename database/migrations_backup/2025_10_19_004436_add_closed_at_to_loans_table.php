<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            // 🕓 Add column only if it doesn't exist
            if (!Schema::hasColumn('loans', 'closed_at')) {
                $table->timestamp('closed_at')->nullable()->after('due_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            if (Schema::hasColumn('loans', 'closed_at')) {
                $table->dropColumn('closed_at');
            }
        });
    }
};