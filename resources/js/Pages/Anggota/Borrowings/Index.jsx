import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    BookmarkCheck, 
    BookOpen, 
    Calendar, 
    Clock, 
    AlertTriangle, 
    QrCode, 
    MapPin, 
    CheckCircle2, 
    ArrowRight, 
    Sparkles, 
    ShieldCheck,
    Info
} from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function Index({ activeBorrowings, historyBorrowings, stats }) {
    const { library_settings } = usePage().props;
    const finePerDay = library_settings?.fine_per_day || 1000;
    const durationDays = library_settings?.borrow_duration_days || 7;
    const maxLimit = library_settings?.max_borrow_limit || 3;
    return (
        <AnggotaLayout activeMenu="borrowings">
            <Head title="Buku Sedang Dipinjam - Anggota" />

            <div className="space-y-6 w-full">
                {/* 1. Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-sm">
                                <BookmarkCheck className="w-5 h-5 stroke-[2.5]" />
                            </span>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">
                                Buku yang Sedang Saya Pinjam
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Daftar koleksi buku fisik perpustakaan yang sedang aktif Anda pinjam beserta jadwal jatuh tempo
                        </p>
                    </div>

                    <Link
                        href="/anggota/scan"
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 self-start sm:self-center shrink-0 cursor-pointer"
                    >
                        <QrCode className="w-4 h-4 stroke-[2.5]" />
                        <span>+ Scan Pinjam Buku di Rak</span>
                    </Link>
                </div>

                {/* 2. Quota & Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Quota Metric */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kuota Pinjam Aktif</span>
                            <p className="text-2xl font-black text-slate-950">
                                {stats.active_count} <span className="text-sm font-bold text-slate-400">/ {stats.max_limit} Eksemplar</span>
                            </p>
                            <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-amber-500 h-full rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (stats.active_count / stats.max_limit) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <BookmarkCheck className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>

                    {/* Status Overdue */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Keterlambatan</span>
                            <p className={`text-2xl font-black ${stats.overdue_count > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {stats.overdue_count > 0 ? `${stats.overdue_count} Eksemplar Terlambat` : 'Semua Tepat Waktu'}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium">
                                {stats.overdue_count > 0 ? 'Segera kembalikan ke meja petugas' : 'Durasi pinjam standar 7 hari'}
                            </span>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${stats.overdue_count > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {stats.overdue_count > 0 ? <AlertTriangle className="w-6 h-6 stroke-[2.5]" /> : <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />}
                        </div>
                    </div>

                    {/* Total History */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Riwayat Pinjam</span>
                            <p className="text-2xl font-black text-indigo-700">
                                {stats.history_count} <span className="text-sm font-bold text-slate-400">Transaksi</span>
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium">
                                Jejak literasi di SIMPUS
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                            <Sparkles className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>
                </div>

                {/* 3. Active Borrowed Books Cards Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-extrabold text-base text-slate-950 flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                            <span>Koleksi Fisik yang Sedang Dipinjam ({activeBorrowings.length})</span>
                        </h2>
                    </div>

                    {activeBorrowings && activeBorrowings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeBorrowings.map((item) => (
                                <div 
                                    key={item.id}
                                    className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-5 transition-all hover:shadow-lg ${
                                        item.is_overdue ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200/80'
                                    }`}
                                >
                                    {/* Top Card Info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-800 text-[10px] font-extrabold rounded-full">
                                                [{item.category_code}] {item.category_name}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-amber-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                                {item.copy_code}
                                            </span>
                                        </div>

                                        <h3 className="font-extrabold text-base text-slate-950 line-clamp-2 leading-snug">
                                            {item.book_title}
                                        </h3>

                                        <div className="space-y-1 text-xs text-slate-500 font-medium">
                                            <p>Penulis: <strong className="text-slate-800">{item.author}</strong></p>
                                            <p className="flex items-center space-x-1">
                                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span>Lokasi: Rak {item.rack_code} ({item.rack_location})</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates & Countdown Badge */}
                                    <div className="pt-3 border-t border-slate-100 space-y-3">
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 flex items-center space-x-1">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Tgl Pinjam:</span>
                                                </span>
                                                <span className="font-mono font-bold text-slate-800">{item.borrowed_at}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 flex items-center space-x-1">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>Jatuh Tempo:</span>
                                                </span>
                                                <span className="font-mono font-bold text-slate-900">{item.due_date}</span>
                                            </div>
                                        </div>

                                        {/* Status Alert Badge */}
                                        {item.is_overdue ? (
                                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-1.5 font-extrabold text-rose-700">
                                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                                        <span>Terlambat {item.overdue_days} Hari</span>
                                                    </div>
                                                    <span className="font-bold text-rose-800 font-mono">
                                                        Rp {item.estimated_fine.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-rose-600 font-medium">
                                                    Estimasi Denda: <strong>{item.fineable_days ?? item.overdue_days} hari</strong> dikenakan denda (@ Rp {finePerDay.toLocaleString('id-ID')}/hari)
                                                </p>
                                                {item.exempt_days > 0 && (
                                                    <p className="text-[10px] text-emerald-700 font-bold">
                                                        ✓ Bebas Denda: {item.exempt_days} hari (
                                                        {item.sunday_exempt_days > 0 ? `${item.sunday_exempt_days} Minggu` : ''}
                                                        {item.sunday_exempt_days > 0 && item.holiday_exempt_days > 0 ? ' + ' : ''}
                                                        {item.holiday_exempt_days > 0 ? `${item.holiday_exempt_days} Tanggal Merah` : ''}
                                                        )
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between font-bold">
                                                <span className="flex items-center space-x-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span>Status Berjalan</span>
                                                </span>
                                                <span className="font-mono text-emerald-700">Sisa {item.remaining_days} Hari</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
                                <BookmarkCheck className="w-8 h-8 stroke-[2.5]" />
                            </div>
                            <div className="space-y-1 max-w-sm mx-auto">
                                <h3 className="font-extrabold text-base text-slate-950">Tidak Ada Peminjaman Aktif</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Anda sedang tidak meminjam buku fisik apa pun. Cari buku favorit Anda di katalog atau scan barcode langsung di rak perpustakaan.
                                </p>
                            </div>
                            <div className="pt-2 flex justify-center space-x-3">
                                <Link
                                    href="/anggota/katalog"
                                    className="px-5 py-2.5 bg-white border border-slate-300 hover:border-amber-500 text-slate-800 font-bold rounded-2xl text-xs shadow-sm transition-all"
                                >
                                    Jelajahi Katalog
                                </Link>
                                <Link
                                    href="/anggota/scan"
                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow transition-all"
                                >
                                    Scan Barcode di Rak
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. History of Returned Books */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-extrabold text-base text-slate-950 flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <span>Riwayat Buku yang Sudah Dikembalikan</span>
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                    <tr>
                                        <th className="px-6 py-3.5">Kode Transaksi</th>
                                        <th className="px-6 py-3.5">Buku & Eksemplar</th>
                                        <th className="px-6 py-3.5">Tgl Pinjam</th>
                                        <th className="px-6 py-3.5">Tgl Dikembalikan</th>
                                        <th className="px-6 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {historyBorrowings.data && historyBorrowings.data.length > 0 ? (
                                        historyBorrowings.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="px-6 py-4 font-mono font-bold text-amber-800 whitespace-nowrap">
                                                    {item.borrowing_code}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 line-clamp-1">{item.book_copy?.book?.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">{item.book_copy?.copy_code}</p>
                                                </td>
                                                <td className="px-6 py-4 font-mono whitespace-nowrap text-slate-600">
                                                    {item.borrowed_at ? new Date(item.borrowed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 font-mono whitespace-nowrap text-slate-600">
                                                    {item.returned_at ? new Date(item.returned_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Dikembalikan
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                                                Belum ada riwayat pengembalian buku.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {historyBorrowings.links && historyBorrowings.links.length > 3 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    Total {historyBorrowings.total} riwayat pengembalian
                                </span>
                                <div className="flex items-center space-x-1">
                                    {historyBorrowings.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                link.active
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                    : link.url
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    : 'text-slate-300 pointer-events-none'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Information Guideline Footer Banner */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-6 flex items-start space-x-3.5">
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 leading-relaxed font-medium space-y-1">
                        <p className="font-bold">Ketentuan Sirkulasi Peminjaman SIMPUS Politeknik Indonusa Surakarta:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                            <li>Batas maksimal peminjaman aktif adalah <strong>{maxLimit} eksemplar buku</strong> secara bersamaan.</li>
                            <li>Batas waktu masa pinjam buku fisik adalah <strong>{durationDays} hari kalender</strong> terhitung sejak pengesahan petugas.</li>
                            <li>Keterlambatan pengembalian buku dikenakan denda administrasi sebesar <strong>Rp {finePerDay.toLocaleString('id-ID')} / hari per eksemplar</strong>.</li>
                            <li>Pengembalian buku fisik dilakukan langsung di <strong>Meja Sirkulasi Pustakawan</strong>.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AnggotaLayout>
    );
}
