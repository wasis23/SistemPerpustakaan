import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    QrCode, 
    BookmarkCheck, 
    Clock, 
    Search, 
    ChevronRight, 
    Sparkles 
} from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function Dashboard({ stats, activeTickets, activeBorrowings }) {
    return (
        <AnggotaLayout activeMenu="dashboard" activeTicketsCount={stats.active_tickets}>
            <Head title="Dashboard Anggota" />

            {/* Full Width Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                {/* Middle Column (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Featured Hero Banner */}
                    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-4 max-w-2xl">
                            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Fitur Sirkulasi Mandiri SIMPUS</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                                Pinjam Buku Langsung dari Rak Tanpa Antre!
                            </h1>
                            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
                                Pindai stiker barcode di rak fisik, stok buku otomatis ditahan selama 5 menit. Tunjukkan layar tiket HP ke meja petugas.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3">
                                <Link
                                    href="/anggota/scan"
                                    className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2"
                                >
                                    <QrCode className="w-4 h-4 stroke-[2.5]" />
                                    <span>Scan Barcode Rak Sekarang</span>
                                </Link>
                                <Link
                                    href="/anggota/katalog"
                                    className="px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl text-xs border border-white/20 transition-all flex items-center space-x-1.5"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>Jelajahi Katalog</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Popular / Active Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-base text-slate-950 flex items-center space-x-2">
                                <BookOpen className="w-5 h-5 text-amber-600" />
                                <span>Koleksi Rekomendasi Populer</span>
                            </h3>
                            <Link href="/anggota/katalog" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1">
                                <span>Lihat Semua Katalog</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Popular Cards Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <Link href="/anggota/katalog" className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-full h-36 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-amber-700 mb-3 group-hover:scale-105 transition-all">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-full">DDC 600</span>
                                <h4 className="font-bold text-slate-950 text-xs mt-2 line-clamp-1 group-hover:text-amber-700">Rekam Medis & Kesehatan</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">Penulis Utama SIMPUS</p>
                            </Link>

                            <Link href="/anggota/katalog" className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-full h-36 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-center text-indigo-700 mb-3 group-hover:scale-105 transition-all">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-bold text-indigo-800 uppercase bg-indigo-100 px-2 py-0.5 rounded-full">DDC 000</span>
                                <h4 className="font-bold text-slate-950 text-xs mt-2 line-clamp-1 group-hover:text-indigo-700">Algoritma & Pemrograman</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">Fakultas Ilmu Komputer</p>
                            </Link>

                            <Link href="/anggota/katalog" className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-full h-36 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-all">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">DDC 500</span>
                                <h4 className="font-bold text-slate-950 text-xs mt-2 line-clamp-1 group-hover:text-emerald-700">Farmakologi & Obat</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">Jurusan Farmasi</p>
                            </Link>
                        </div>
                    </div>

                    {/* Metrics Pills Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                                <BookmarkCheck className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-slate-950">{stats.active_borrowings}</p>
                                <p className="text-xs text-slate-500 font-medium">Buku Dipinjam</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                                <QrCode className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-emerald-700">{stats.active_tickets}</p>
                                <p className="text-xs text-slate-500 font-medium">Tiket 5 Menit</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shrink-0">
                                <Clock className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-slate-950">{stats.total_history}</p>
                                <p className="text-xs text-slate-500 font-medium">Riwayat Transaksi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Card 1: Active Tickets Widget */}
                    <div id="tiket-section" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-slate-950 flex items-center space-x-2">
                                <QrCode className="w-4 h-4 text-emerald-600" />
                                <span>Tiket Digital Aktif</span>
                            </h3>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                {stats.active_tickets} Tiket
                            </span>
                        </div>

                        {activeTickets && activeTickets.length > 0 ? (
                            <div className="space-y-3">
                                {activeTickets.map((ticket) => {
                                    const title = ticket.bookCopy?.book?.title || ticket.copy?.book?.title || 'Judul Buku';
                                    const copyCode = ticket.bookCopy?.copy_code || '';
                                    return (
                                        <div key={ticket.id} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                                            <div>
                                                <p className="font-extrabold text-slate-950 text-xs line-clamp-1">{title}</p>
                                                <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                                                    Kode: <span className="font-bold text-emerald-800">{ticket.ticket_code}</span>
                                                    {copyCode && <span> ({copyCode})</span>}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/anggota/ticket/${ticket.id}`}
                                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow text-center block"
                                            >
                                                Tampilkan Barcode HP ➔
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                                <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="text-xs text-slate-500 font-medium">Belum ada tiket penahanan stok aktif.</p>
                                <Link href="/anggota/scan" className="text-xs font-bold text-amber-700 hover:underline block">
                                    + Scan Barcode Buku di Rak
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Card 2: Feature Promo Banner */}
                    <div className="bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-base leading-snug">
                            Penuhi Kebutuhan Literasi Akademik Anda!
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            Gunakan Kios Presensi di pintu utama untuk mencatat kunjungan harian & sirkulasi mandiri secara instan.
                        </p>
                        <Link
                            href="/anggota/katalog"
                            className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all"
                        >
                            Cari Judul Referensi ➔
                        </Link>
                    </div>

                    {/* Card 3: Active Borrowed Books List */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-950 flex items-center space-x-2">
                            <BookmarkCheck className="w-4 h-4 text-amber-600" />
                            <span>Buku Sedang Dipinjam</span>
                        </h3>

                        {activeBorrowings && activeBorrowings.length > 0 ? (
                            <div className="space-y-3">
                                {activeBorrowings.map((b) => {
                                    const title = b.bookCopy?.book?.title || b.copy?.book?.title || 'Judul Buku';
                                    const copyCode = b.bookCopy?.copy_code || '';
                                    const isOverdue = b.due_date && new Date(b.due_date) < new Date();
                                    const formattedDueDate = b.due_date ? new Date(b.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

                                    return (
                                        <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                                            <div className="w-10 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-950 text-xs truncate">{title}</p>
                                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                                    <span className="text-slate-500 font-mono">
                                                        {copyCode || b.borrowing_code}
                                                    </span>
                                                    <span className={`font-bold font-mono px-1.5 py-0.5 rounded ${isOverdue ? 'bg-rose-100 text-rose-800' : 'text-slate-600'}`}>
                                                        Kembali: {formattedDueDate}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-xs text-slate-500 font-medium">
                                Tidak ada buku yang sedang Anda pinjam.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnggotaLayout>
    );
}
