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
            $table->text('access_url')->change();
            $table->string('title', 500)->change();
            $table->string('publisher', 500)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('national_journals', function (Blueprint $table) {
            $table->string('access_url', 255)->change();
            $table->string('title', 255)->change();
            $table->string('publisher', 255)->change();
        });
    }
};
