<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BorrowTicket;
use App\Models\Category;
use App\Models\Rack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CirculationLockingTest extends TestCase
{
    use RefreshDatabase;

    protected User $student1;
    protected User $student2;
    protected User $officer;
    protected BookCopy $bookCopy;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup User Anggota & Petugas
        $this->student1 = User::create([
            'username' => 'mhs001',
            'name' => 'Mahasiswa Test 1',
            'email' => 'mhs001@polindonusa.ac.id',
            'password' => bcrypt('password'),
            'role' => 'anggota',
            'status' => 'active',
            'prodi' => 'S1 Informatika',
        ]);

        $this->student2 = User::create([
            'username' => 'mhs002',
            'name' => 'Mahasiswa Test 2',
            'email' => 'mhs002@polindonusa.ac.id',
            'password' => bcrypt('password'),
            'role' => 'anggota',
            'status' => 'active',
            'prodi' => 'D3 Rekam Medis',
        ]);

        $this->officer = User::create([
            'username' => 'pustakawan',
            'name' => 'Pustakawan Test',
            'email' => 'petugas@polindonusa.ac.id',
            'password' => bcrypt('password'),
            'role' => 'petugas',
            'status' => 'active',
        ]);

        $category = Category::create(['code' => '000', 'name' => 'Karya Umum']);
        $rack = Rack::create(['code_rack' => 'RAK-TEST', 'location' => 'Lantai 1']);

        $book = Book::create([
            'title' => 'Buku Uji Konkuransi',
            'author' => 'Penulis Uji',
            'category_id' => $category->id,
            'rack_id' => $rack->id,
            'total_copies' => 1,
        ]);

        $this->bookCopy = BookCopy::create([
            'book_id' => $book->id,
            'copy_code' => 'IND-000-TEST-1-A',
            'barcode_hash' => 'BC-LOCKTEST123',
            'condition' => 'good',
            'status' => 'available',
        ]);
    }

    /**
     * Test pembuatan tiket sukses oleh mahasiswa pertama
     */
    public function test_student_can_create_ticket_successfully(): void
    {
        $response = $this->actingAs($this->student1)
            ->post('/anggota/ticket', [
                'barcode_hash' => 'BC-LOCKTEST123',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('borrow_tickets', [
            'user_id' => $this->student1->id,
            'book_copy_id' => $this->bookCopy->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('book_copies', [
            'id' => $this->bookCopy->id,
            'status' => 'ticketed',
        ]);
    }

    /**
     * Test penahanan stok ilusi: Mahasiswa kedua ditolak saat mencoba scan eksemplar yang sedang ticketed
     */
    public function test_second_student_is_rejected_when_book_is_already_ticketed(): void
    {
        // Student 1 scan & menahan eksemplar
        $this->actingAs($this->student1)
            ->post('/anggota/ticket', [
                'barcode_hash' => 'BC-LOCKTEST123',
            ]);

        // Student 2 mencoba scan eksemplar yang sama
        $response = $this->actingAs($this->student2)
            ->post('/anggota/ticket', [
                'barcode_hash' => 'BC-LOCKTEST123',
            ]);

        $response->assertSessionHasErrors(['barcode_hash']);

        // Pastikan hanya ada 1 tiket di DB milik student1
        $this->assertEquals(1, BorrowTicket::where('book_copy_id', $this->bookCopy->id)->count());
        $this->assertDatabaseHas('borrow_tickets', [
            'user_id' => $this->student1->id,
            'book_copy_id' => $this->bookCopy->id,
        ]);
    }

    /**
     * Test pelepasan tiket kadaluwarsa (>5 menit)
     */
    public function test_expired_ticket_is_auto_released(): void
    {
        // Buat tiket yang sudah kadaluarsa (10 menit lalu)
        $ticket = BorrowTicket::create([
            'ticket_code' => 'TCK-EXPIRED-999',
            'user_id' => $this->student1->id,
            'book_copy_id' => $this->bookCopy->id,
            'expires_at' => now()->subMinutes(10),
            'status' => 'pending',
        ]);

        $this->bookCopy->update(['status' => 'ticketed']);

        // Jalankan perintah artisan release
        $this->artisan('simpus:release-tickets')
            ->assertExitCode(0);

        // Verifikasi tiket berubah ke expired & eksemplar kembali ke available
        $this->assertDatabaseHas('borrow_tickets', [
            'id' => $ticket->id,
            'status' => 'expired',
        ]);

        $this->assertDatabaseHas('book_copies', [
            'id' => $this->bookCopy->id,
            'status' => 'available',
        ]);

        // Sekarang student 2 bisa meminjam eksemplar tersebut
        $response = $this->actingAs($this->student2)
            ->post('/anggota/ticket', [
                'barcode_hash' => 'BC-LOCKTEST123',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('borrow_tickets', [
            'user_id' => $this->student2->id,
            'book_copy_id' => $this->bookCopy->id,
            'status' => 'pending',
        ]);
    }
}
