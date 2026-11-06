<?php

use App\Models\Book;
use App\Models\Category;
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
        // Pastikan seluruh 10 kelas utama DDC ada
        foreach (Category::MAIN_CLASSES as $code => $name) {
            Category::firstOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => "Kelas utama DDC {$code}",
                ]
            );
        }

        // Remap semua buku yang memiliki kategori sub-kelas atau nomor panggil sub-kelas
        $books = Book::with('category')->get();
        foreach ($books as $book) {
            $targetCat = null;

            // Prioritas 1: Jika call_number mengandung DDC spesifik (misal: 001, 001.42, 621.8)
            if (!empty($book->call_number)) {
                $targetCat = Category::findMainCategory($book->call_number);
            }

            // Prioritas 2: Dari kategori yang terhubung saat ini
            if (!$targetCat && $book->category) {
                $targetCat = Category::findMainCategory($book->category->code);
            }

            if ($targetCat && $book->category_id !== $targetCat->id) {
                $book->category_id = $targetCat->id;
                $book->save();
            }
        }

        // Hapus kategori selain 10 kelas utama DDC jika tidak memiliki buku
        Category::whereNotIn('code', array_keys(Category::MAIN_CLASSES))
            ->whereDoesntHave('books')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Tidak perlu reverse penghapusan sub-kategori
    }
};
