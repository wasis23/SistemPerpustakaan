<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Borrowing;
use App\Models\Category;
use App\Models\Rack;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationAndCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_ten_ddc_categories_exist(): void
    {
        $this->seed(\Database\Seeders\CategorySeeder::class);

        $expectedCodes = ['000', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
        $categories = Category::orderBy('code', 'asc')->get();

        $this->assertEquals(10, $categories->count());
        $this->assertEquals($expectedCodes, $categories->pluck('code')->toArray());

        $cat000 = $categories->where('code', '000')->first();
        $this->assertStringContainsString('Karya Umum, Ilmu Komputer, dan Informasi', $cat000->name);

        $cat600 = $categories->where('code', '600')->first();
        $this->assertStringContainsString('Teknologi dan Ilmu Terapan', $cat600->name);
    }

    public function test_notification_creation_on_borrow_and_return(): void
    {
        $mhs = User::factory()->create([
            'username' => 'mhs_notif',
            'role' => 'anggota',
            'member_type' => 'mahasiswa',
            'status' => 'active',
        ]);

        $officer = User::factory()->create([
            'username' => 'officer_notif',
            'role' => 'petugas',
            'status' => 'active',
        ]);

        $category = Category::firstOrCreate(
            ['code' => '000'],
            ['name' => 'Karya Umum, Ilmu Komputer, dan Informasi (Generalities)']
        );
        $rack = Rack::create(['code_rack' => 'R-01', 'name' => 'Rak 1', 'location' => 'Lantai 1']);
        $book = Book::create([
            'title' => 'Pemrograman Modern dengan Laravel & React',
            'category_id' => $category->id,
            'rack_id' => $rack->id,
            'author' => 'Penulis',
            'publisher' => 'Penerbit',
            'year' => 2024,
            'isbn' => '978-1-23456-789-1',
            'stock' => 1,
        ]);
        $copy = BookCopy::create([
            'book_id' => $book->id,
            'copy_code' => 'NOTIF-CPY-01',
            'barcode_hash' => 'NOTIF-BAR-01',
            'status' => 'borrowed',
            'condition' => 'good',
        ]);

        $borrowing = Borrowing::create([
            'borrowing_code' => 'TRX-NOTIF-01',
            'user_id' => $mhs->id,
            'book_copy_id' => $copy->id,
            'officer_id' => $officer->id,
            'borrowed_at' => now(),
            'due_date' => now()->addDays(7),
            'status' => 'active',
        ]);

        // 1. Uji Notifikasi Peminjaman
        $borrowNotif = UserNotification::notifyBorrowing($mhs, $borrowing);
        $this->assertEquals('borrowing_success', $borrowNotif->type);
        $this->assertEquals($mhs->id, $borrowNotif->user_id);
        $this->assertNull($borrowNotif->read_at);
        $this->assertStringContainsString('Peminjaman Buku Berhasil', $borrowNotif->title);

        // 2. Uji Notifikasi Pengembalian
        $borrowing->update(['status' => 'returned', 'returned_at' => now()]);
        $returnNotif = UserNotification::notifyReturn($mhs, $borrowing, 0);
        $this->assertEquals('return_success', $returnNotif->type);
        $this->assertEquals($mhs->id, $returnNotif->user_id);
        $this->assertStringContainsString('Buku Berhasil Dikembalikan', $returnNotif->title);
        $this->assertStringContainsStringIgnoringCase('tepat waktu', $returnNotif->message);

        // 3. Uji Mark As Read Endpoint
        $this->actingAs($mhs)
            ->post("/notifications/{$borrowNotif->id}/read")
            ->assertRedirect();

        $this->assertNotNull($borrowNotif->fresh()->read_at);

        // 4. Uji Mark All Read Endpoint
        $this->actingAs($mhs)
            ->post('/notifications/mark-all-read')
            ->assertRedirect();

        $this->assertNotNull($returnNotif->fresh()->read_at);
    }

    public function test_ddc_subclasses_map_to_main_classes_correctly(): void
    {
        $this->seed(\Database\Seeders\CategorySeeder::class);

        // 1. Uji Normalisasi Static
        $this->assertEquals('000', Category::normalizeDdcToMainClass('001'));
        $this->assertEquals('000', Category::normalizeDdcToMainClass('001.42'));
        $this->assertEquals('000', Category::normalizeDdcToMainClass('001.42 SUG m'));
        $this->assertEquals('000', Category::normalizeDdcToMainClass('004'));
        $this->assertEquals('000', Category::normalizeDdcToMainClass('025.04'));
        $this->assertEquals('100', Category::normalizeDdcToMainClass('150'));
        $this->assertEquals('100', Category::normalizeDdcToMainClass('153.42'));
        $this->assertEquals('200', Category::normalizeDdcToMainClass('297.1'));
        $this->assertEquals('300', Category::normalizeDdcToMainClass('330.1'));
        $this->assertEquals('400', Category::normalizeDdcToMainClass('420'));
        $this->assertEquals('500', Category::normalizeDdcToMainClass('510'));
        $this->assertEquals('600', Category::normalizeDdcToMainClass('621.8 Sum a'));
        $this->assertEquals('600', Category::normalizeDdcToMainClass('658.4'));
        $this->assertEquals('700', Category::normalizeDdcToMainClass('720'));
        $this->assertEquals('800', Category::normalizeDdcToMainClass('808.8'));
        $this->assertEquals('900', Category::normalizeDdcToMainClass('959.8'));

        // 2. Uji findMainCategory
        $cat000 = Category::findMainCategory('001');
        $this->assertNotNull($cat000);
        $this->assertEquals('000', $cat000->code);

        $cat001_42 = Category::findMainCategory('001.42');
        $this->assertNotNull($cat001_42);
        $this->assertEquals('000', $cat001_42->code);

        $cat600 = Category::findMainCategory('621.8 Sum a');
        $this->assertNotNull($cat600);
        $this->assertEquals('600', $cat600->code);

        // 3. Uji Pembuatan Buku dengan Call Number Sub-Kelas via Controller
        $officer = User::factory()->create(['role' => 'petugas', 'status' => 'active', 'username' => 'officer_ddc']);
        $rack = Rack::create(['code_rack' => 'RAK-01', 'name' => 'Rak 1', 'location' => 'Lantai 1']);

        // Input buku dengan Call Number "001.42 SUG m"
        $response = $this->actingAs($officer)->post('/petugas/books', [
            'title' => 'Metode Penelitian Kuantitatif',
            'author' => 'Prof. Sugiyono',
            'publisher' => 'Alfabeta',
            'publish_year' => 2023,
            'procurement_year' => 2024,
            'procurement_month' => 5,
            'category_id' => $cat600->id, // Bahkan jika salah pilih id kategori lain di request
            'rack_id' => $rack->id,
            'collection_type' => 'Buku Teks',
            'call_number' => '001.42 SUG m',
            'initial_copies' => 2,
        ]);

        $response->assertRedirect();

        $savedBook = Book::where('title', 'Metode Penelitian Kuantitatif')->first();
        $this->assertNotNull($savedBook);
        $this->assertEquals('001.42 SUG m', $savedBook->call_number);
        // Otomatis terdata ke kelas utama 000!
        $this->assertEquals('000', $savedBook->fresh()->category->code);

        // 4. Uji Filter dan Search Katalog
        $mhs = User::factory()->create(['role' => 'anggota', 'status' => 'active', 'username' => 'mhs_ddc']);
        $catalogRes = $this->actingAs($mhs)->get('/anggota/katalog?search=001.42');
        $catalogRes->assertOk();
        $catalogRes->assertInertia(fn ($page) => $page
            ->has('books.data', 1)
            ->where('books.data.0.call_number', '001.42 SUG m')
            ->where('books.data.0.category.code', '000')
        );

        // Filter via category_id=001 (sub-kelas DDC)
        $filterRes = $this->actingAs($mhs)->get('/anggota/katalog?category_id=001');
        $filterRes->assertOk();
        $filterRes->assertInertia(fn ($page) => $page
            ->has('books.data', 1)
            ->where('books.data.0.call_number', '001.42 SUG m')
        );
    }
}
