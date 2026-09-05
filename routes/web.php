<?php

use App\Http\Controllers\Anggota\BorrowingController as AnggotaBorrowingController;
use App\Http\Controllers\Anggota\CatalogController as AnggotaCatalogController;
use App\Http\Controllers\Anggota\DashboardController as AnggotaDashboardController;
use App\Http\Controllers\Anggota\ProfileController as AnggotaProfileController;
use App\Http\Controllers\Anggota\TicketController as AnggotaTicketController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\JournalPublicController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LecturerBookPublicController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\Petugas\BookController as PetugasBookController;
use App\Http\Controllers\Petugas\CategoryController as PetugasCategoryController;
use App\Http\Controllers\Petugas\CirculationController as PetugasCirculationController;
use App\Http\Controllers\Petugas\DashboardController as PetugasDashboardController;
use App\Http\Controllers\Petugas\LaboratoryController as PetugasLaboratoryController;
use App\Http\Controllers\Petugas\LecturerBookController as PetugasLecturerBookController;
use App\Http\Controllers\Petugas\MemberController as PetugasMemberController;
use App\Http\Controllers\Petugas\NationalJournalController as PetugasNationalJournalController;
use App\Http\Controllers\Petugas\PostController as PetugasPostController;
use App\Http\Controllers\Petugas\ProfileController as PetugasProfileController;
use App\Http\Controllers\Petugas\RackController as PetugasRackController;
use App\Http\Controllers\Petugas\ReportController as PetugasReportController;
use App\Http\Controllers\Petugas\SettingController as PetugasSettingController;
use Illuminate\Support\Facades\Route;

// Halaman Utama Publik SIMPUS, Katalog Publik & Berita
Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/katalog', [AnggotaCatalogController::class, 'indexPublic'])->name('katalog.index');
Route::get('/katalog/{book}', [AnggotaCatalogController::class, 'showPublic'])->name('katalog.show');
Route::get('/karya-dosen', [LecturerBookPublicController::class, 'index'])->name('karya-dosen.index');
Route::get('/karya-dosen/{lecturer_book:slug}', [LecturerBookPublicController::class, 'show'])->name('karya-dosen.show');
Route::get('/jurnal-nasional', [JournalPublicController::class, 'nasional'])->name('jurnal.nasional');
Route::get('/jurnal-internasional', [JournalPublicController::class, 'internasional'])->name('jurnal.internasional');
Route::get('/prosiding', [JournalPublicController::class, 'prosiding'])->name('jurnal.prosiding');
Route::get('/jurnal', fn() => redirect()->route('jurnal.nasional'))->name('jurnal.index');
Route::get('/berita', [NewsController::class, 'index'])->name('news.index');
Route::get('/berita/{slug}', [NewsController::class, 'show'])->name('news.show');

// Kiosk Presensi Kunjungan Pintu Masuk
Route::get('/presensi', [AttendanceController::class, 'kiosk'])->name('presensi.kiosk');
Route::post('/presensi', [AttendanceController::class, 'store'])->name('presensi.store');

// Guest Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Role Anggota (Mahasiswa & Dosen)
    Route::middleware('role:anggota')->prefix('anggota')->name('anggota.')->group(function () {
        Route::get('/dashboard', [AnggotaDashboardController::class, 'index'])->name('dashboard');

        // Buku Sedang Dipinjam & Riwayat Pinjam Anggota
        Route::get('/borrowings', [AnggotaBorrowingController::class, 'index'])->name('borrowings.index');

        // Alias Rute Katalog Anggota
        Route::get('/katalog', [AnggotaCatalogController::class, 'index'])->name('catalog.index');
        Route::get('/katalog/{book}', [AnggotaCatalogController::class, 'show'])->name('catalog.show');

        // Profil & Ganti Password Anggota (Mahasiswa / Dosen)
        Route::get('/profile', [AnggotaProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [AnggotaProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [AnggotaProfileController::class, 'updatePassword'])->name('profile.password.update');

        // Scanner Barcode HP & Tiket Mandiri 5 Menit
        Route::get('/scan', [AnggotaTicketController::class, 'showScanner'])->name('scan');
        Route::post('/ticket', [AnggotaTicketController::class, 'createTicket'])->name('ticket.store');
        Route::get('/ticket/{ticket}', [AnggotaTicketController::class, 'showTicket'])->name('ticket.show');
        Route::post('/ticket/{ticket}/cancel', [AnggotaTicketController::class, 'cancelTicket'])->name('ticket.cancel');
    });

    // Role Petugas (Pustakawan / Administrator)
    Route::middleware('role:petugas')->prefix('petugas')->name('petugas.')->group(function () {
        Route::get('/dashboard', [PetugasDashboardController::class, 'index'])->name('dashboard');

        // Manajemen Profil & Ganti Password Pustakawan
        Route::get('/profile', [PetugasProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [PetugasProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [PetugasProfileController::class, 'updatePassword'])->name('profile.password.update');

        // Manajemen Anggota Perpustakaan (Mahasiswa & Dosen)
        Route::get('/members', [PetugasMemberController::class, 'index'])->name('members.index');
        Route::post('/members', [PetugasMemberController::class, 'store'])->name('members.store');
        Route::put('/members/{member}', [PetugasMemberController::class, 'update'])->name('members.update');
        Route::put('/members/{member}/password', [PetugasMemberController::class, 'updatePassword'])->name('members.password.update');
        Route::delete('/members/{member}', [PetugasMemberController::class, 'destroy'])->name('members.destroy');

        // Rekap Presensi Kunjungan
        Route::get('/presensi', [AttendanceController::class, 'index'])->name('presensi.index');

        // Manajemen Buku & Barcode Label
        Route::get('/books/fetch-api', [PetugasBookController::class, 'fetchExternalMetadata'])->name('books.fetch-api');
        Route::get('/books/download-template', [PetugasBookController::class, 'downloadTemplate'])->name('books.download-template');
        Route::post('/books/import-csv', [PetugasBookController::class, 'importCsv'])->name('books.import');
        Route::delete('/books/reset-all', [PetugasBookController::class, 'resetAll'])->name('books.reset-all');
        Route::get('/books/{book}/print-barcodes', [PetugasBookController::class, 'printBarcodes'])->name('books.print-barcodes');
        Route::post('/books/{book}/add-copies', [PetugasBookController::class, 'addCopies'])->name('books.add-copies');
        Route::resource('books', PetugasBookController::class);

        // Manajemen Master Data (Kategori DDC & Lokasi Rak Fisik)
        Route::resource('categories', PetugasCategoryController::class);
        Route::resource('racks', PetugasRackController::class);

        // Manajemen Virtual Tour Perpustakaan 360°
        Route::resource('laboratories', PetugasLaboratoryController::class);

        // Meja Sirkulasi & Validasi Transaksi Peminjaman / Pengembalian
        Route::get('/circulations', [PetugasCirculationController::class, 'index'])->name('circulations.index');
        Route::get('/circulations/scan-ticket', [PetugasCirculationController::class, 'scanTicketForm'])->name('circulations.scan-ticket');
        Route::post('/circulations/validate-ticket', [PetugasCirculationController::class, 'validateTicket'])->name('circulations.validate-ticket');
        Route::get('/circulations/scan-return', [PetugasCirculationController::class, 'scanReturnForm'])->name('circulations.scan-return');
        Route::post('/circulations/process-return', [PetugasCirculationController::class, 'processReturn'])->name('circulations.process-return');
        Route::post('/circulations/{borrowing}/pay-fine', [PetugasCirculationController::class, 'payFine'])->name('circulations.pay-fine');

        // Pengaturan Aturan Sirkulasi, Tarif Denda & Hari Libur (Tanggal Merah)
        Route::get('/settings', [PetugasSettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [PetugasSettingController::class, 'update'])->name('settings.update');
        Route::post('/settings/holidays', [PetugasSettingController::class, 'storeHoliday'])->name('settings.holidays.store');
        Route::delete('/settings/holidays/{holiday}', [PetugasSettingController::class, 'destroyHoliday'])->name('settings.holidays.destroy');

        // Manajemen Berita, Pengumuman & Artikel (SEO Supported & LLM AI Generation)
        Route::post('/posts/generate-ai', [PetugasPostController::class, 'generateWithAi'])->name('posts.generate-ai');
        Route::post('/posts/{post}/toggle-featured', [PetugasPostController::class, 'toggleFeatured'])->name('posts.toggle-featured');
        Route::resource('posts', PetugasPostController::class);

        // Manajemen Karya Buku Dosen (Terpisah dari Katalog Fisik, Tanpa No Inventaris)
        Route::get('/lecturer-books/download-template', [PetugasLecturerBookController::class, 'downloadTemplate'])->name('lecturer-books.download-template');
        Route::post('/lecturer-books/import-csv', [PetugasLecturerBookController::class, 'importCsv'])->name('lecturer-books.import-csv');
        Route::get('/lecturer-books/export-csv', [PetugasLecturerBookController::class, 'exportCsv'])->name('lecturer-books.export-csv');
        Route::post('/lecturer-books/{lecturer_book}/toggle-featured', [PetugasLecturerBookController::class, 'toggleFeatured'])->name('lecturer-books.toggle-featured');
        Route::resource('lecturer-books', PetugasLecturerBookController::class);

        // Manajemen Jurnal Nasional (SINTA, ISSN, e-ISSN, OJS Link)
        Route::get('/national-journals/download-template', [PetugasNationalJournalController::class, 'downloadTemplate'])->name('national-journals.download-template');
        Route::post('/national-journals/import-csv', [PetugasNationalJournalController::class, 'importCsv'])->name('national-journals.import-csv');
        Route::get('/national-journals/export-csv', [PetugasNationalJournalController::class, 'exportCsv'])->name('national-journals.export-csv');
        Route::post('/national-journals/{national_journal}/toggle-status', [PetugasNationalJournalController::class, 'toggleStatus'])->name('national-journals.toggle-status');
        Route::resource('national-journals', PetugasNationalJournalController::class);

        // Laporan & Rekapitulasi Analytics
        Route::get('/reports', [PetugasReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export-csv', [PetugasReportController::class, 'exportCsv'])->name('reports.export-csv');
        Route::get('/reports/print-pdf', [PetugasReportController::class, 'printPdf'])->name('reports.print-pdf');
    });
});
