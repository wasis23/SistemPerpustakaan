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
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->boolean('is_external')->default(false)->after('user_id')->index();
            $table->string('visitor_name')->nullable()->after('is_external');
            $table->string('visitor_institution')->nullable()->after('visitor_name');
            $table->string('visitor_phone')->nullable()->after('visitor_institution');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropColumn(['is_external', 'visitor_name', 'visitor_institution', 'visitor_phone']);
        });
    }
};
