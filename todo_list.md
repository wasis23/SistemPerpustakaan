# 📋 TO-DO LIST IMPLEMENTASI SISTEM INFORMASI PERPUSTAKAAN (SIMPUS)
**Politeknik Indonusa Surakarta**

Dokumen ini adalah rencana kerja (roadmap) dan daftar tugas pengembangan sistem informasi perpustakaan digital berdasarkan spesifikasi arsitektur pada `agent.md`.

---

## 🚀 FASA 1: INISIALISASI PROYEK & FONDASI ARSITEKTUR
- [x] **1.1 Setup Environment & Framework**
  - [x] Inisialisasi proyek Laravel 11 dengan adapter Inertia.js (React).
  - [x] Setup Tailwind CSS / custom CSS system untuk antarmuka pengguna yang responsif.
  - [x] Konfigurasi basis data MySQL (`.env` dan integritas referensial).
- [x] **1.2 Sistem Autentikasi & Kontrol Akses (RBAC)**
  - [x] Implementasi autentikasi pengguna (AuthController dengan dukungan Username/NIM & Email).
  - [x] Setup 2 Peran Utama (`anggota` dan `petugas`) tanpa super admin.
  - [x] Buat Middleware Otorisasi (`RoleMiddleware`) untuk pembatasan akses rute.

---

## 🗄️ FASA 2: DESIGN BASIS DATA & MIGRATION
- [x] **2.1 Migration Skema Tabel Utama**
  - [x] `users`: ID, username, name, email, password, role (`anggota`/`petugas`), prodi, status.
  - [x] `categories`: ID, code, name, description.
  - [x] `racks`: ID, code_rack, location, description.
  - [x] `books` (Data Induk): ID, isbn, title, author, publisher, publish_year, category_id, rack_id, cover_image.
  - [x] `book_copies` (Eksemplar Fisik): ID, book_id, copy_code (Alfanumerik Unik), barcode_hash, status (`available`, `ticketed`, `borrowed`, `damaged`, `lost`).
  - [x] `attendance_logs`: ID, user_id, visit_purpose, checked_in_at.
  - [x] `borrow_tickets`: ID, ticket_code, user_id, book_copy_id, expires_at, status (`pending`, `validated`, `expired`, `cancelled`).
  - [x] `borrowings`: ID, borrowing_code, user_id, book_copy_id, ticket_id, officer_id, borrowed_at, due_date, returned_at, fine_amount, status (`active`, `returned`, `overdue`).
- [x] **2.2 Model & Relasi Eloquent**
  - [x] Definisikan relasi `Book` `hasMany` `BookCopy`, `User` `hasMany` `Borrowings`, dsb.
  - [x] Setup Seeder Awal (Data dummy petugas, sampel kategori DDC, sampel rak, dan sampel buku eksemplar).

---

## 🚪 FASA 3: MODUL PRESENSI KUNJUNGAN TERAUTENTIKASI
- [x] **3.1 Antarmuka Terminal Kios Pintu Masuk**
  - [x] Layout khusus *full-screen kiosk* (`resources/js/Pages/Presensi/Kiosk.jsx`) bebas navigasi umum.
  - [x] Formulir masukan kredensial resmi (Username/NIM & Password).
  - [x] Pilihan tujuan kunjungan interaktif (*Membaca Mandiri*, *Peminjaman Koleksi*, *Penyusunan Riset*, *Akses Komputer*).
- [x] **3.2 Logika Backend Presensi**
  - [x] Controller (`AttendanceController.php`) validasi kredensial pengguna tanpa simpan *session login* permanen di kios.
  - [x] Catat log kehadiran pengunjung ke tabel `attendance_logs`.
  - [x] Fitur *Auto-Reset* 3 detik dengan modal selamat datang visual & live ticker pengunjung real-time.
  - [x] Halaman monitoring & rekapitulasi presensi pengunjung untuk Petugas (`Petugas/Presensi/Index.jsx`).

---

## 📚 FASA 4: MODUL KATALOGISASI & BARCODE FISIK
- [x] **4.1 Manajemen Katalog Buku**
  - [x] CRUD Data Induk Buku (`books`) dan pengelompokan Kategori DDC/Rak Lokasi (`Petugas/BookController.php`).
  - [x] Pencarian interaktif & filter katalog (Judul, Pengarang, ISBN, Kategori, Rak) untuk Anggota (`Anggota/CatalogController.php`) & Petugas (`Petugas/BookController.php`).
- [x] **4.2 Impor Massal & Penomoran Eksemplar Unik**
  - [x] Fitur parser CSV/Text Impor massal untuk entry katalog buku jumlah banyak.
  - [x] Generasi otomatis ID Alfanumerik Unik per eksemplar fisik (`book_copies`) & Barcode Hash.
- [x] **4.3 Auto-Generate Label Barcode Fisik**
  - [x] Integrasi library `picqer/php-barcode-generator` (`BarcodeService.php` SVG/HTML barcode Code-128).
  - [x] Layout cetak stiker label fisik buku (`Petugas/Books/PrintBarcodes.jsx`) siap cetak/PDF dengan gaya `@media print`.

---

## 📱 FASA 5: MODUL SIRKULASI TIKET DIGITAL MANDIRI (SCAN-FIRST)
- [x] **5.1 Integrasi Pemindai Kamera Seluler (Sisi Anggota)**
  - [x] Antarmuka web mobile (`Anggota/Scan.jsx`) dengan modul kamera `html5-qrcode` & masukan fallback manual.
  - [x] Alur kerja: Anggota mengambil buku di rak ➔ Pindai stiker barcode fisik di rak via kamera HP.
- [x] **5.2 Logika Tiket Dinamis & Pessimistic Locking**
  - [x] Implementasi `DB::transaction` + `lockForUpdate()` pada `TicketController.php` untuk mencegah penahanan stok ilusi & race condition.
  - [x] Pengecekan real-time ketersediaan eksemplar (`status == 'available'`).
  - [x] Generasi Tiket Digital Dinamis dengan masa berlaku singkat (*Short TTL* 5 menit).
  - [x] Tampilan kartu tiket digital (`Anggota/Ticket/Show.jsx`) dengan rendered QR Code SVG & timer hitung mundur (*countdown*).
  - [x] Tombol *"Batal Pinjam"* mandiri untuk melepaskan penguncian status eksemplar seketika ke `available`.
- [x] **5.3 Automated Release Scheduler (Queue / Task Scheduling)**
  - [x] Artisan Command `simpus:release-tickets` (`ReleaseExpiredTickets.php`).
  - [x] Helper otomatis `BorrowTicket::releaseExpiredTickets()` yang menyapu tiket kadaluwarsa (>5 menit) dan mengembalikan status eksemplar ke `available`.
- [x] **5.4 Validasi Meja Sirkulasi (Sisi Petugas)**
  - [x] Antarmuka meja petugas dengan dukungan pemindai alat *barcode scanner* fisik.
  - [x] Petugas memindai QR tiket di layar HP anggota.
  - [x] Validasi otomatis & pengesahan transaksi peminjaman (mengikat `user_id`, `book_copy_id`, `officer_id`, dan `due_date`).

---

## 🔄 FASA 6: MODUL PENGEMBALIAN & KALKULASI DENDA OTOMATIS
- [x] **6.1 Alur Pengembalian Buku**
  - [x] Antarmuka khusus pengembalian (`Petugas/Circulation/ScanReturn.jsx`) di layar petugas.
  - [x] Petugas memindai barcode fisik buku yang dikembalikan via alat pemindai fisik / input.
  - [x] Sistem otomatis mencocokkan kode eksemplar dengan data peminjaman aktif & mengembalikan status eksemplar ke `available`.
- [x] **6.2 Kalkulasi Denda Otomatis**
  - [x] Logika kalkulasi denda otomatis: `overdue_days * Rp 1.000 / hari` keterlambatan.
  - [x] Pencatatan status denda (`unpaid` / `none`), pelunasan denda interaktif, dan statistik keuangan denda.

---

## 📊 FASA 7: REKAPITULASI, LAPORAN & DASHBOARD
- [x] **7.1 Dashboard Anggota & Petugas**
  - [x] Dashboard Anggota: Analytics pinjaman aktif, riwayat peminjaman, tagihan denda, dan pintasan tiket berjalan.
  - [x] Dashboard Petugas: Counter kunjungan harian real-time, sirkulasi aktif, tiket antrean, alert jatuh tempo, dan tombol navigasi sirkulasi.
- [x] **7.2 Laporan & Rekapitulasi Data**
  - [x] Filter laporan dinamis berdasarkan rentang tanggal, Program Studi, Kategori DDC, dan Tujuan Kunjungan (`Petugas/ReportController.php`).
  - [x] Ekspor data rekapitulasi ke format CSV/Excel dan pratinjau cetak PDF resmi institusi (`Petugas/Reports/Print.jsx`) lengkap dengan Kop Surat & blok tanda tangan.

---

## 🧪 FASA 8: PENGUJIAN, KEAMANAN & POLISHING
- [x] **8.1 Testing Pengujian Beban & Konkuransi**
  - [x] Unit test logika *Pessimistic Locking* & penahanan stok ilusi (`CirculationLockingTest.php`).
  - [x] Test otomatisasi *auto-release* tiket kadaluwarsa (`simpus:release-tickets`).
  - [x] Test Kios Presensi Kunjungan & Autentikasi Anggota (`AttendanceKioskTest.php`).
  - [x] Seluruh unit test suite lulus 100% (8/8 tests passed).
- [x] **8.2 Keamanan & Optimasi Antarmuka**
  - [x] Audit Keamanan: CSRF Protection, Role Middleware (`role:petugas`, `role:anggota`), Sanitasi Input CSV & Sanitasi String.
  - [x] Kompilasi Aset Produksi Vite/React terspesialisasi & ter-minifikasi (`npm run build`).
