<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BorrowingRuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_mahasiswa_borrowing_rules(): void
    {
        $mhs = User::factory()->create([
            'username' => 'mhs_202401',
            'role' => 'anggota',
            'member_type' => 'mahasiswa',
            'prodi' => 'D4 Teknologi Rekayasa Perangkat Lunak',
            'status' => 'active',
        ]);

        $this->assertTrue($mhs->canBorrow());
        $this->assertEquals(2, $mhs->getMaxBorrowLimit());
        $this->assertEquals(7, $mhs->getBorrowDurationDays());
        $this->assertEquals('Mahasiswa', $mhs->member_type_label);
    }

    public function test_dosen_tendik_borrowing_rules(): void
    {
        $dsn = User::factory()->create([
            'username' => 'dsn_202401',
            'role' => 'anggota',
            'member_type' => 'dosen_tendik',
            'prodi' => 'Dosen / Tendik',
            'status' => 'active',
        ]);

        $this->assertTrue($dsn->canBorrow());
        $this->assertEquals(4, $dsn->getMaxBorrowLimit());
        $this->assertEquals(14, $dsn->getBorrowDurationDays());
        $this->assertEquals('Dosen / Tendik', $dsn->member_type_label);
    }

    public function test_eksternal_borrowing_rules(): void
    {
        $eks = User::factory()->create([
            'username' => 'eks_202401',
            'role' => 'anggota',
            'member_type' => 'eksternal',
            'prodi' => 'Anggota Eksternal',
            'status' => 'active',
        ]);

        $this->assertFalse($eks->canBorrow());
        $this->assertEquals(0, $eks->getMaxBorrowLimit());
        $this->assertEquals(0, $eks->getBorrowDurationDays());
        $this->assertEquals('Anggota Eksternal', $eks->member_type_label);
        $this->assertEquals('Hanya baca di tempat (tidak boleh meminjam)', $eks->getBorrowRuleDescription());
    }

    public function test_eksternal_cannot_create_borrow_ticket(): void
    {
        $eks = User::factory()->create([
            'username' => 'eks_202402',
            'role' => 'anggota',
            'member_type' => 'eksternal',
            'prodi' => 'Anggota Eksternal',
            'status' => 'active',
        ]);

        $category = Category::first() ?? Category::create(['name' => 'IT', 'code' => '001']);
        $rack = Rack::first() ?? Rack::create(['code_rack' => 'R-01', 'name' => 'Rak 1', 'location' => 'Lantai 1']);
        $book = Book::create([
            'title' => 'Buku Uji Peminjaman',
            'category_id' => $category->id,
            'rack_id' => $rack->id,
            'author' => 'Penulis Uji',
            'publisher' => 'Penerbit Uji',
            'year' => 2024,
            'isbn' => '978-1-23456-789-0',
            'stock' => 1,
        ]);
        $copy = BookCopy::create([
            'book_id' => $book->id,
            'copy_code' => 'TEST-CPY-01',
            'barcode_hash' => 'TEST-BARCODE-01',
            'status' => 'available',
            'condition' => 'good',
        ]);

        $response = $this->actingAs($eks)
            ->post('/anggota/ticket', [
                'barcode_hash' => $copy->barcode_hash,
                'copy_code' => $copy->copy_code,
            ]);

        $response->assertSessionHasErrors(['copy_code']);
    }

    public function test_mahasiswa_exceeding_borrow_limit_is_blocked(): void
    {
        $mhs = User::factory()->create([
            'username' => 'mhs_limit_test',
            'role' => 'anggota',
            'member_type' => 'mahasiswa',
            'prodi' => 'D4 Teknologi Rekayasa Perangkat Lunak',
            'status' => 'active',
        ]);

        $officer = User::factory()->create([
            'username' => 'petugas_test',
            'role' => 'petugas',
            'status' => 'active',
        ]);

        $category = Category::first() ?? Category::create(['name' => 'IT', 'code' => '001']);
        $rack = Rack::first() ?? Rack::create(['code_rack' => 'R-01', 'name' => 'Rak 1', 'location' => 'Lantai 1']);
        $book = Book::create([
            'title' => 'Buku Uji Limit',
            'category_id' => $category->id,
            'rack_id' => $rack->id,
            'author' => 'Penulis',
            'publisher' => 'Penerbit',
            'year' => 2024,
            'isbn' => '978-1-23456-789-9',
            'stock' => 5,
        ]);

        // Berikan 2 pinjaman aktif (mencapai batas 2 buku)
        for ($i = 1; $i <= 2; $i++) {
            $copy = BookCopy::create([
                'book_id' => $book->id,
                'copy_code' => "LIMIT-CPY-0{$i}",
                'barcode_hash' => "LIMIT-BARCODE-0{$i}",
                'status' => 'borrowed',
                'condition' => 'good',
            ]);

            \App\Models\Borrowing::create([
                'borrowing_code' => "TRX-TEST-0{$i}",
                'user_id' => $mhs->id,
                'book_copy_id' => $copy->id,
                'officer_id' => $officer->id,
                'borrowed_at' => now(),
                'due_date' => now()->addDays(7),
                'status' => 'active',
            ]);
        }

        // Salinan ke-3 untuk dipinjam
        $copy3 = BookCopy::create([
            'book_id' => $book->id,
            'copy_code' => 'LIMIT-CPY-03',
            'barcode_hash' => 'LIMIT-BARCODE-03',
            'status' => 'available',
            'condition' => 'good',
        ]);

        $response = $this->actingAs($mhs)
            ->post('/anggota/ticket', [
                'barcode_hash' => $copy3->barcode_hash,
                'copy_code' => $copy3->copy_code,
            ]);

        $response->assertSessionHasErrors(['copy_code']);
    }
}
