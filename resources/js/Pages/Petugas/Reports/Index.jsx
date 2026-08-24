import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { FileText, Printer, Filter, BookOpen, Users, DollarSign, Calendar, FileSpreadsheet, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ 
    filters = {}, 
    summary = {}, 
    circulations = { data: [] }, 
    attendances = { data: [] },
    topBooks = [],
    categories = []
}) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [reportType, setReportType] = useState(filters.type || 'circulation');
    const [prodi, setProdi] = useState(filters.prodi || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/reports', { 
            start_date: startDate, 
            end_date: endDate, 
            type: reportType,
            prodi: prodi,
            category_id: categoryId
        }, { preserveState: true });
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setReportType('circulation');
        setProdi('');
        setCategoryId('');
        router.get('/petugas/reports', {}, { preserveState: true });
    };

    const handlePrint = () => {
        const queryParams = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            type: reportType,
            prodi: prodi,
            category_id: categoryId
        }).toString();
        window.open(`/petugas/reports/print?${queryParams}`, '_blank');
    };

    const handleExportCsv = () => {
        const queryParams = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            type: reportType,
        }).toString();
        window.location.href = `/petugas/reports/export-csv?${queryParams}`;
    };

    const totalCirculations = summary.total_circulations ?? 0;
    const totalReturned = summary.total_returned ?? 0;
    const totalOverdue = summary.total_overdue ?? 0;
    const totalFines = summary.total_fines ?? 0;
    const totalVisits = summary.total_visits ?? 0;

    const circulationsList = circulations.data || [];
    const attendancesList = attendances.data || [];

    return (
        <PetugasLayout activeMenu="reports" todayVisitsCount={totalVisits}>
            <Head title="Rekapitulasi & Laporan Analytics - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Rekapitulasi & Laporan Analytics</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Analisis tren perpustakaan, statistik sirkulasi, presensi & denda</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-amber-500 rounded-2xl text-xs font-bold text-slate-700 hover:text-amber-700 transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                            <Download className="w-4 h-4 text-emerald-600" />
                            <span>Unduh CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5"
                        >
                            <Printer className="w-4 h-4 stroke-[2.5]" />
                            <span>Cetak Cetak / PDF</span>
                        </button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Total Sirkulasi</span>
                            <BookOpen className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-950 mt-3">{totalCirculations}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Transaksi peminjaman</p>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Buku Dikembalikan</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-700 mt-3">{totalReturned}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Selesai dikembalikan</p>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Lewat Jatuh Tempo</span>
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-rose-600 mt-3">{totalOverdue}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Menunggak pengembalian</p>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Presensi Kunjungan</span>
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-indigo-700 mt-3">{totalVisits}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Log di pintu masuk</p>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Total Denda</span>
                            <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-amber-800 mt-3">
                            Rp {totalFines.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Kalkulasi keterlambatan</p>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Akhir</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Laporan</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="circulation">Laporan Sirkulasi Peminjaman</option>
                                <option value="attendance">Laporan Presensi Kunjungan</option>
                                <option value="books">Laporan Koleksi Buku</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3 flex items-end space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1 shadow"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="py-2 px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Main Data Tables Section - Full Width */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {/* Circulation Transactions Table */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm space-y-3 p-6">
                        <h3 className="font-extrabold text-slate-950 text-sm flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                            <span>Data Transaksi Sirkulasi ({circulationsList.length})</span>
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Kode / Peminjam</th>
                                        <th className="px-4 py-3">Judul Buku</th>
                                        <th className="px-4 py-3 text-right">Status / Denda</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {circulationsList.length > 0 ? (
                                        circulationsList.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50/80">
                                                <td className="px-4 py-3">
                                                    <p className="font-mono font-bold text-amber-800">{c.borrowing_code}</p>
                                                    <p className="text-[10px] text-slate-500">{c.user?.name}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-slate-900 line-clamp-1">{c.book_copy?.book?.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">{c.book_copy?.copy_code}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase">
                                                        {c.status}
                                                    </span>
                                                    {c.fine_amount > 0 && (
                                                        <p className="text-[10px] font-bold text-rose-600 mt-0.5">
                                                            Rp {c.fine_amount.toLocaleString('id-ID')}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                                                Tidak ada data sirkulasi dalam rentang ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Presensi Kunjungan Table */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm space-y-3 p-6">
                        <h3 className="font-extrabold text-slate-950 text-sm flex items-center space-x-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span>Data Log Presensi Kunjungan ({attendancesList.length})</span>
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Pengunjung</th>
                                        <th className="px-4 py-3 text-right">Tujuan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {attendancesList.length > 0 ? (
                                        attendancesList.map((v) => (
                                            <tr key={v.id} className="hover:bg-slate-50/80">
                                                <td className="px-4 py-3 font-mono text-amber-800 font-bold whitespace-nowrap">
                                                    {new Date(v.checked_in_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-slate-900">{v.user?.name}</p>
                                                    <p className="text-[10px] text-slate-500">{v.user?.username} ({v.user?.prodi || 'Mahasiswa'})</p>
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold">
                                                        {v.visit_purpose}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                                                Tidak ada log presensi kunjungan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
