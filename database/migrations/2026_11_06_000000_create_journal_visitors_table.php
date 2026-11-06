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
        Schema::create('journal_visitors', function (Blueprint $table) {
            $table->id();
            $table->string('journal_type', 30)->index(); // 'nasional', 'internasional', 'prosiding'
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->string('session_id', 100)->nullable()->index();
            $table->timestamp('visited_at')->useCurrent()->index();
            $table->timestamps();

            $table->index(['journal_type', 'visited_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_visitors');
    }
};
