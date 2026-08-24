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
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();
            $table->string('borrowing_code')->unique()->index(); // TRX-20260824-0001
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('book_copy_id')->constrained('book_copies')->onDelete('cascade');
            $table->foreignId('ticket_id')->nullable()->constrained('borrow_tickets')->onDelete('set null');
            $table->foreignId('officer_id')->constrained('users')->onDelete('cascade'); // Petugas validator
            $table->timestamp('borrowed_at')->useCurrent();
            $table->timestamp('due_date')->index();
            $table->timestamp('returned_at')->nullable();
            $table->decimal('fine_amount', 12, 2)->default(0);
            $table->enum('fine_status', ['none', 'unpaid', 'paid'])->default('none');
            $table->enum('status', ['active', 'returned', 'overdue'])->default('active')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrowings');
    }
};
