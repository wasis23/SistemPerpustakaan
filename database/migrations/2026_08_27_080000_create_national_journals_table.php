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
        Schema::create('national_journals', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul Jurnal / Nama Jurnal
            $table->string('prodi')->index(); // Program Studi
            $table->string('publisher'); // Penerbit / LPPM
            $table->string('access_url'); // Link Akses Jurnal (URL)
            $table->string('sinta')->default('Non-SINTA')->index(); // SINTA 1, SINTA 2, SINTA 3, SINTA 4, SINTA 5, SINTA 6, Non-SINTA, Proses Akreditasi
            $table->string('issn')->nullable()->index(); // ISSN Cetak
            $table->string('e_issn')->nullable()->index(); // e-ISSN Elektronik
            $table->string('frequency')->nullable(); // Frekuensi Terbit (misal: 2 Kali Setahun)
            $table->text('description')->nullable(); // Fokus & Ruang Lingkup
            $table->string('cover_image')->nullable(); // Gambar Sampul / Logo Jurnal
            $table->string('doi_prefix')->nullable(); // DOI Prefix
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('national_journals');
    }
};
