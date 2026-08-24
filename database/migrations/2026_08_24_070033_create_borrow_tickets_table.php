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
        Schema::create('borrow_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique()->index(); // Misal: TCK-20260824-A1B2
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('book_copy_id')->constrained('book_copies')->onDelete('cascade');
            $table->timestamp('expires_at')->index();
            $table->enum('status', ['pending', 'validated', 'expired', 'cancelled'])->default('pending')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrow_tickets');
    }
};
