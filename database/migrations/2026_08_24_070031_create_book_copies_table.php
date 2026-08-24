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
        Schema::create('book_copies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->string('copy_code')->unique(); // ID Eksemplar Unik alfanumerik (misal: BOK-001-A)
            $table->string('barcode_hash')->unique()->index(); // String Barcode/QR Code unik fisik
            $table->enum('condition', ['good', 'slightly_damaged', 'damaged'])->default('good');
            $table->enum('status', ['available', 'ticketed', 'borrowed', 'damaged', 'lost'])->default('available')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_copies');
    }
};
