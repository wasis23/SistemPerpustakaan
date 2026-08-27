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
        Schema::table('national_journals', function (Blueprint $table) {
            $table->string('journal_type')->default('Nasional')->after('title')->index(); // 'Nasional' | 'Internasional'
            $table->string('country')->nullable()->after('publisher'); // Negara Penerbit
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('national_journals', function (Blueprint $table) {
            $table->dropColumn(['journal_type', 'country']);
        });
    }
};
