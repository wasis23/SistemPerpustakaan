import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Shield, 
    QrCode, 
    BookOpen, 
    Users, 
    ArrowRightLeft, 
    FileSpreadsheet, 
    AlertTriangle, 
    Monitor, 
    Sparkles,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Dashboard({ stats }) {
    return (
        <PetugasLayout activeMenu="dashboard" todayVisitsCount={stats.today_visits}>
            <Head title="Dashboard Petugas Pustakawan" />

            {/* Dashboard Grid Content - Full Width */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                {/* Middle Column (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Featured Hero Banner */}
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-4 max-w-2xl">
                            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Meja Operasional Pustakawan</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                                Pengesahan Tiket HP & Pengembalian Buku Real-Time
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                                Gunakan pemindai barcode untuk mengesahkan tiket penahanan stok 5 menit dari HP anggota atau mengembalikan eksemplar buku fisik ke rak.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3">
                                <Link
                                    href="/petugas/circulations/scan-ticket"
                                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2"
                                >
                                    <QrCode className="w-4 h-4 stroke-[2.5]" />
                                    <span>Scan Tiket HP Anggota</span>
                                </Link>
                                <Link
                                    href="/petugas/circulations/scan-return"
                                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2"
                                >
                                    <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                                    <span>Scan Pengembalian Buku</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Operational Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-base text-slate-950 flex items-center space-x-2">
                                <Shield className="w-5 h-5 text-amber-600" />
                                <span>Pilihan Akses Cepat Operasional</span>
                            </h3>
                            <Link href="/petugas/circulations" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1">
                                <span>Lihat Semua Transaksi</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link href="/petugas/books" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-105 transition-all">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-950 text-xs group-hover:text-amber-700">Katalog & Barcode</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Tambah judul, eksemplar & cetak stiker barcode fisik.</p>
                                </div>
                            </Link>

                            <Link href="/petugas/presensi" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold group-hover:scale-105 transition-all">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-950 text-xs group-hover:text-indigo-700">Rekap Kunjungan</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Monitoring log presensi mahasiswa & dosen di kiosk.</p>
                                </div>
                            </Link>

                            <Link href="/petugas/reports" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-105 transition-all">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-950 text-xs group-hover:text-emerald-700">Laporan & Cetak PDF</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Ekspor rekapitulasi sirkulasi & denda resmi institusi.</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Section 2: Metrics Overview Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link href="/petugas/presensi" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all block">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kunjungan Hari Ini</span>
                            <p className="text-2xl font-black text-slate-950 mt-2">{stats.today_visits}</p>
                            <span className="text-[10px] text-amber-700 font-bold mt-1 block">Presensi Kiosk</span>
                        </Link>

                        <Link href="/petugas/circulations" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all block">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tiket Pending</span>
                            <p className="text-2xl font-black text-emerald-700 mt-2">{stats.pending_tickets}</p>
                            <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Menunggu Scan</span>
                        </Link>

                        <Link href="/petugas/circulations" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all block">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sedang Dipinjam</span>
                            <p className="text-2xl font-black text-slate-950 mt-2">{stats.active_borrowings}</p>
                            <span className="text-[10px] text-slate-500 font-bold mt-1 block">Buku Dibawa</span>
                        </Link>

                        <Link href="/petugas/circulations" className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all block">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Terlambat Kembali</span>
                            <p className="text-2xl font-black text-rose-600 mt-2">{stats.overdue_borrowings}</p>
                            <span className="text-[10px] text-rose-600 font-bold mt-1 block">Menunggak Denda</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Card 1: Terminal Kios Access Widget */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-slate-950 flex items-center space-x-2">
                                <Monitor className="w-4 h-4 text-amber-600" />
                                <span>Terminal Kios Presensi</span>
                            </h3>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Online
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Jalankan antarmuka Kiosk Layar Sentuh di PC Pintu Utama untuk mencatat presensi terautentikasi NIM mahasiswa.
                        </p>
                        <Link
                            href="/presensi"
                            target="_blank"
                            className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow text-center flex items-center justify-center space-x-2"
                        >
                            <Monitor className="w-4 h-4 text-amber-400" />
                            <span>Buka Layar Kiosk Kunjungan ➔</span>
                        </Link>
                    </div>

                    {/* Card 2: Feature Status Promo Card */}
                    <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-base leading-snug">
                            Penahanan Stok Barcode 5 Menit Real-Time
                        </h3>
                        <p className="text-xs text-amber-100 leading-relaxed font-medium">
                            Sistem otomatis mengunci eksemplar buku di rak ketika mahasiswa memindai stiker barcode, mencegah bentrok peminjaman.
                        </p>
                        <Link
                            href="/petugas/circulations/scan-ticket"
                            className="inline-block px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow transition-all"
                        >
                            Mulai Scan Tiket ➔
                        </Link>
                    </div>

                    {/* Card 3: Pending Tickets Queue Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-slate-950 flex items-center space-x-2">
                                <QrCode className="w-4 h-4 text-emerald-600" />
                                <span>Tiket Menunggu Scan</span>
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {stats.pending_tickets} Pending
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Mahasiswa yang telah melakukan scan stiker buku di rak dan sedang menuju ke meja pustakawan.
                        </p>

                        <Link
                            href="/petugas/circulations/scan-ticket"
                            className="w-full py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold text-center block transition-all"
                        >
                            Buka Pemindai Tiket HP ➔
                        </Link>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
