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
        Schema::create('lecturer_books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('authors'); // Nama Dosen / Tim Penulis
            $table->string('nidn')->nullable()->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('prodi')->index();
            $table->string('publication_type')->default('Buku Ajar')->index(); // Buku Ajar, Monograf, Buku Referensi, Modul Praktikum, Book Chapter, dll.
            $table->string('isbn')->nullable()->index();
            $table->string('publisher')->nullable();
            $table->unsignedSmallInteger('publish_year')->nullable()->index();
            $table->string('city')->nullable();
            $table->string('edition')->nullable();
            $table->unsignedInteger('pages')->nullable();
            $table->text('synopsis')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('document_url')->nullable(); // File PDF / Dokumen Digital
            $table->string('doi_url')->nullable(); // Link DOI / Google Scholar / SINTA / Repositori
            $table->string('hki_number')->nullable(); // Nomor Sertifikat HKI / Hak Cipta
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecturer_books');
    }
};
