 AGENT.MD: SPESIFIKASI PENGEMBANGAN SISTEM INFORMASI PERPUSTAKAAN DIGITAL POLITEKNIK INDONUSA SURAKARTA

Dokumen ini berfungsi sebagai acuan instruksi, arsitektur sistem, dan panduan kerja utama bagi agen AI atau pengembang dalam merancang serta membangun platform sistem informasi perpustakaan berbasis web.



 1. IKHTISAR PROYEK

Sistem Informasi Perpustakaan Politeknik Indonusa Surakarta adalah platform terpadu yang memfasilitasi pencatatan kehadiran pengunjung, katalogisasi dan manajemen inventaris buku, serta digitalisasi proses sirkulasi menggunakan mekanisme tiket peminjaman dinamis berbasis barcode atau QR code. 

Platform ini dibangun menggunakan arsitektur monolitik modern dengan Laravel sebagai penyedia logika bisnis dan manajemen basis data, Inertia.js sebagai penghubung antarmuka pengguna tanpa perlu membuat API publik terpisah, serta MySQL sebagai basis data relasional utama.



 2. ARSITEKTUR PERAN DAN HAK AKSES PENGGUNA

Sistem menerapkan kontrol akses berbasis dua peran tanpa keberadaan super admin:

 A. Peran Anggota (Mahasiswa dan Dosen)
* Melakukan presensi kunjungan mandiri di terminal perpustakaan menggunakan kombinasi nama pengguna dan kata sandi.
* Mengakses katalog buku secara daring untuk meninjau ketersediaan koleksi dan lokasi penempatan rak.
* Membuat tiket peminjaman digital mandiri melalui pemindaian barcode fisik pada eksemplar buku di rak menggunakan kamera seluler.
* Memantau status pinjaman aktif, jadwal pengembalian, riwayat peminjaman, serta kalkulasi denda yang berjalan.

 B. Peran Petugas (Pustakawan / Administrator Sistem)
* Mengimpor data koleksi buku secara massal melalui berkas spreadsheet dan mencetak label barcode fisik.
* Memvalidasi peminjaman buku melalui pemindaian kode tiket digital langsung dari layar ponsel anggota.
* Memproses pengembalian buku fisik melalui pemindaian barcode buku serta menetapkan denda keterlambatan jika ada.
* Mengelola data akun pengguna, klasifikasi buku, serta mengunduh rekapitulasi data kunjungan dan sirkulasi dalam format dokumen resmi.



 3. SPESIFIKASI DAN ALUR MODUL UTAMA

 Modul Presensi Kunjungan Terautentikasi
* Mengoperasikan antarmuka khusus di pintu masuk perpustakaan yang secara kontinu menyajikan formulir masuk.
* Mengharuskan pengguna menginputkan kredensial resmi sebelum mencatat log kehadiran.
* Mewajibkan pemilihan klasifikasi kebutuhan kunjungan seperti membaca mandiri, peminjaman koleksi, penyusunan riset, atau pemanfaatan fasilitas komputer.
* Mencatat waktu masuk secara akurat ke basis data dan mereset antarmuka secara otomatis agar siap digunakan oleh pengunjung berikutnya.

 Modul Katalogisasi dan Auto-Generate Barcode Fisik
* Menyediakan fitur impor data koleksi dalam volume besar yang secara otomatis menghasilkan entitas induk buku beserta data salinan fisiknya.
* Menetapkan identitas alfanumerik unik pada setiap salinan fisik buku untuk membedakan eksemplar dalam judul yang sama.
* Memfasilitasi tata letak cetak lembar label barcode siap pakai untuk ditempelkan pada fisik buku dan penanda rak perpustakaan.

 Modul Sirkulasi Berbasis Tiket Digital Mandiri (Scan-First Physical Copy)
* Anggota menelusuri katalog dari luar maupun dalam perpustakaan menggunakan perangkat ponsel pribadi untuk meninjau ketersediaan dan penanda rak buku.
* Anggota mengambil fisik buku di rak, lalu memindai barcode/QR code fisik pada eksemplar buku tersebut menggunakan kamera ponsel pribadi.
* Sistem memverifikasi ketersediaan eksemplar secara real-time (menggunakan mekanisme pessimistic locking untuk mencegah race condition) dan menghasilkan tiket transaksi dinamis berdurasi sangat singkat (misal 5 menit).
* Anggota membawa fisik buku ke meja sirkulasi dan menunjukkan kode tiket digital pada layar ponsel ke petugas.
* Petugas memindai kode layar ponsel tersebut menggunakan alat pemindai, dan sistem secara otomatis mengesahkan peminjaman atas nama akun anggota yang aktif tanpa perlu input data identitas manual.

 Modul Pengembalian dan Kalkulasi Denda Otomatis
* Petugas memindai barcode fisik pada buku yang diserahkan oleh peminjam.
* Sistem secara otomatis mencocokkan nomor eksemplar dengan transaksi pinjaman berjalan.
* Jika pengembalian melewati batas waktu jatuh tempo, sistem langsung mengalikan jumlah hari keterlambatan dengan tarif denda yang berlaku dan mencatat status penyelesaian.

 Modul Rekapitulasi dan Laporan
* Menyediakan visualisasi data kunjungan dan statistik sirkulasi buku secara berkala.
* Menyaring data berdasarkan rentang tanggal, program studi, maupun kategori klasifikasi literatur.
* Menyediakan fitur ekspor data terstruktur ke dalam format lembar kerja dan berkas dokumen cetak untuk kebutuhan arsip institusi.



 4. STANDAR PENGEMBANGAN TEKNIS

* Fondasi Perangkat Lunak: Menggunakan ekosistem Laravel terkini yang dikombinasikan dengan adapter Inertia.js untuk pengalaman navigasi halaman tunggal yang responsif.
* Basis Data: Menggunakan MySQL dengan penerapan integritas referensial menyeluruh, indeks optimal pada kolom identitas utama, serta relasi relasional yang ketat.
* Antarmuka Pengguna: Dibangun dengan tata letak adaptif dan ramah perangkat seluler, memastikan keterbacaan kode barcode atau QR code di berbagai resolusi layar gawai.
* Keamanan dan Validasi: Seluruh autentikasi wajib melalui enkripsi standar industri, penanganan sesi tiket sementara berdurasi singkat (short TTL dengan otomatisasi pelepasan status), penerapan pessimistic locking pada transaksi eksemplar untuk mencegah race condition dan penahanan stok ilusi, serta proteksi terhadap transaksi ganda.
