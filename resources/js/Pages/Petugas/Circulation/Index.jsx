import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, Filter, QrCode, ArrowRightLeft, BookOpen, AlertTriangle, CheckCircle2, DollarSign, SlidersHorizontal, Download, Upload } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ borrowings, filters, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/circulations', { search, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/petugas/circulations', {}, { preserveState: true });
    };

    const handlePayFine = (id, amount) => {
        if (confirm(`Konfirmasi pelunasan denda sebesar Rp ${amount.toLocaleString('id-ID')}?`)) {
            router.post(`/petugas/circulations/${id}/pay-fine`);
        }
    };

    const handleExtend = (id, title) => {
        if (confirm(`Konfirmasi perpanjangan masa pinjam buku "${title}"?`)) {
            router.post(`/petugas/circulations/${id}/extend`);
        }
    };

    const statusMap = {
        active: { label: 'Sedang Dipinjam', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        returned: { label: 'Dikembalikan', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        overdue: { label: 'Terlambat', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    };

    return (
        <PetugasLayout activeMenu="circulations">
            <Head title="Manajemen Transaksi Sirkulasi - Petugas" />

            <div className="space-y-6 w-full">
                {/* Notifikasi Sukses Pengembalian Buku */}
                {flash?.return_receipt && (
                    <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-md space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                            <div className="flex items-center space-x-2 text-emerald-800">
                                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                                <span className="font-extrabold text-sm">Buku Berhasil Dikembalikan ke Rak!</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                                {flash.return_receipt.borrowing_code}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-white p-3 rounded-xl border border-emerald-200">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Peminjam</span>
                                <p className="font-bold text-slate-900">{flash.return_receipt.user_name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{flash.return_receipt.user_nim}</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-emerald-200">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Koleksi Buku</span>
                                <p className="font-bold text-slate-900 line-clamp-1">{flash.return_receipt.book_title}</p>
                                <p className="text-[10px] text-amber-800 font-mono font-bold">{flash.return_receipt.copy_code}</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-emerald-200">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status & Denda</span>
                                <p className={`font-bold ${flash.return_receipt.late_days > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {flash.return_receipt.late_days > 0 ? `Terlambat ${flash.return_receipt.late_days} Hari` : 'Tepat Waktu'}
                                </p>
                                <p className="text-[10px] text-slate-600 font-semibold">
                                    Denda: Rp {flash.return_receipt.fine_amount ? flash.return_receipt.fine_amount.toLocaleString('id-ID') : '0'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {flash?.import_errors && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
                        <p className="font-bold mb-2">Beberapa baris dilewati:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {flash.import_errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                        {flash.import_errors_more > 0 && (
                            <p className="mt-2 text-xs">+ {flash.import_errors_more} baris lainnya dilewati.</p>
                        )}
                    </div>
                )}
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Manajemen Sirkulasi Pustakawan</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Peminjaman aktif, pengembalian, dan tagihan denda</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <a
                            href="/petugas/circulations/import/template"
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center space-x-1.5 border border-slate-200"
                            title="Unduh template CSV untuk import data peminjaman"
                        >
                            <Download className="w-4 h-4 text-slate-500" />
                            <span>Template Import</span>
                        </a>

                        <form
                            action="/petugas/circulations/import"
                            method="POST"
                            encType="multipart/form-data"
                            className="flex items-center gap-2"
                            onSubmit={(e) => {
                                const file = e.currentTarget.file?.files?.[0];
                                if (!file) {
                                    e.preventDefault();
                                    alert('Pilih file CSV terlebih dahulu.');
                                    return;
                                }
                            }}
                        >
                            <input type="hidden" name="_token" value={typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') : ''} />
                            <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span>Import Peminjaman</span>
                                <input type="file" name="file" accept=".csv,.txt" className="hidden" onChange={(e) => {
                                    if (e.currentTarget.files?.[0]) {
                                        e.currentTarget.form.submit();
                                    }
                                }} />
                            </label>
                        </form>

                        <Link
                            href="/petugas/settings"
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center space-x-1.5 border border-slate-200"
                            title="Atur batas maksimal eksemplar dan tarif denda per hari"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                            <span>Aturan & Tarif Denda</span>
                        </Link>
                        <Link
                            href="/petugas/circulations/scan-ticket"
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5"
                        >
                            <QrCode className="w-4 h-4" />
                            <span>Scan Tiket HP Anggota</span>
                        </Link>
                        <Link
                            href="/petugas/circulations/scan-return"
                            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5"
                        >
                            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                            <span>Scan Pengembalian Buku</span>
                        </Link>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Peminjaman Aktif</span>
                            <BookOpen className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-950 mt-2">{stats.active_count}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Total Dikembalikan</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-700 mt-2">{stats.returned_count}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Lewat Jatuh Tempo</span>
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-rose-600 mt-2">{stats.overdue_count}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Total Denda Belum Lunas</span>
                            <DollarSign className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-amber-800 mt-2">
                            Rp {stats.unpaid_fines_total.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Kode Transaksi, NIM, Nama, atau Judul Buku..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-4">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Status Sirkulasi</option>
                                <option value="active">Sedang Dipinjam</option>
                                <option value="returned">Dikembalikan</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1 shadow"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="py-2.5 px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Data - Full Width */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                <tr>
                                    <th className="px-6 py-3.5">Kode Sirkulasi</th>
                                    <th className="px-6 py-3.5">Peminjam (Anggota)</th>
                                    <th className="px-6 py-3.5">Buku & Eksemplar</th>
                                    <th className="px-6 py-3.5">Jatuh Tempo</th>
                                    <th className="px-6 py-3.5 text-center">Status & Denda</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {borrowings.data && borrowings.data.length > 0 ? (
                                    borrowings.data.map((item) => {
                                        const badge = statusMap[item.status] || { label: item.status, color: 'bg-slate-100 text-slate-800' };
                                        const isOverdue = item.status === 'active' && new Date(item.due_date) < new Date();
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="px-6 py-4 font-mono font-bold text-amber-800 whitespace-nowrap">
                                                    {item.borrowing_code}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900">{item.user?.name}</p>
                                                    <p className="text-[10px] text-slate-500">{item.user?.username} • {item.user?.prodi || '-'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 line-clamp-1">{item.book_copy?.book?.title}</p>
                                                    <p className="text-[10px] font-mono text-amber-800 font-bold">{item.book_copy?.copy_code}</p>
                                                </td>
                                                <td className="px-6 py-4 font-mono whitespace-nowrap">
                                                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                                                        {new Date(item.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <span className={`inline-block border px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            isOverdue ? 'bg-rose-100 text-rose-800 border-rose-200' : badge.color
                                                        }`}>
                                                            {isOverdue ? 'Terlambat' : badge.label}
                                                        </span>
                                                        {/* Nominal Denda Berjalan jika Masih Terlambat & Aktif */}
                                                        {isOverdue && item.current_fine > 0 && (
                                                            <p className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                                Denda: Rp {item.current_fine.toLocaleString('id-ID')} ({item.late_days} hr)
                                                            </p>
                                                        )}
                                                        {/* Nominal Denda Tercatat jika Sudah Dikembalikan / Terbit Denda */}
                                                        {item.fine_amount > 0 && (
                                                            <p className={`text-[10px] font-bold ${
                                                                item.fine_status === 'paid' ? 'text-emerald-700' : 'text-amber-800'
                                                            }`}>
                                                                Rp {item.fine_amount.toLocaleString('id-ID')} ({item.fine_status === 'paid' ? 'Lunas' : 'Belum Lunas'})
                                                            </p>
                                                        )}
                                                        {item.extension_count > 0 && (
                                                            <span className="block text-[9px] text-blue-700 font-bold">
                                                                Perpanjangan ke-{item.extension_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        {item.status === 'active' && !isOverdue && (item.extension_count || 0) < 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleExtend(item.id, item.book_copy?.book?.title)}
                                                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold rounded-xl text-[10px] transition-all"
                                                                title="Perpanjang Masa Pinjam"
                                                            >
                                                                Perpanjang
                                                            </button>
                                                        )}
                                                        {item.fine_status === 'unpaid' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePayFine(item.id, item.fine_amount)}
                                                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[10px] shadow transition-all"
                                                            >
                                                                Pelunasan Denda
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            Belum ada data sirkulasi peminjaman.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
