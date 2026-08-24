import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Users, Search, Filter, BookOpen, GraduationCap, Monitor, Library } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ logs, filters, stats }) {
    const [search, setSearch] = useState(filters.search || '');
    const [purpose, setPurpose] = useState(filters.purpose || '');
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/presensi', { search, purpose, date }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setPurpose('');
        const todayStr = new Date().toISOString().split('T')[0];
        setDate(todayStr);
        router.get('/petugas/presensi', { date: todayStr }, { preserveState: true });
    };

    const purposeMap = {
        reading: { label: 'Membaca Mandiri', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
        borrowing: { label: 'Peminjaman Koleksi', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        research: { label: 'Penyusunan Riset', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
        computer: { label: 'Akses Komputer', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    };

    return (
        <PetugasLayout activeMenu="presensi" todayVisitsCount={stats.today_total}>
            <Head title="Rekap Presensi Kunjungan - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Rekap Presensi Kunjungan</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Monitoring kehadiran mahasiswa & dosen di perpustakaan</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/presensi"
                            target="_blank"
                            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-2"
                        >
                            <Monitor className="w-4 h-4" />
                            <span>Buka Terminal Kios</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Total Pengunjung</span>
                            <Users className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-950 mt-2">{stats.today_total}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Membaca Mandiri</span>
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-indigo-700 mt-2">{stats.reading_total}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Peminjaman Koleksi</span>
                            <Library className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-700 mt-2">{stats.borrowing_total}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Penyusunan Riset</span>
                            <GraduationCap className="w-4 h-4 text-cyan-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-cyan-700 mt-2">{stats.research_total}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase">Akses Komputer</span>
                            <Monitor className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-extrabold text-amber-800 mt-2">{stats.computer_total}</p>
                    </div>
                </div>

                {/* Filter Form Bar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau NIM..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Tujuan Kunjungan</option>
                                <option value="reading">Membaca Mandiri</option>
                                <option value="borrowing">Peminjaman Koleksi</option>
                                <option value="research">Penyusunan Riset</option>
                                <option value="computer">Akses Komputer</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
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
                                    <th className="px-6 py-3.5">Waktu Presensi</th>
                                    <th className="px-6 py-3.5">NIM / Username</th>
                                    <th className="px-6 py-3.5">Nama Pengunjung</th>
                                    <th className="px-6 py-3.5">Program Studi</th>
                                    <th className="px-6 py-3.5">Tujuan Kunjungan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data && logs.data.length > 0 ? (
                                    logs.data.map((log) => {
                                        const purp = purposeMap[log.visit_purpose] || { label: log.visit_purpose, color: 'bg-slate-100 text-slate-800' };
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="px-6 py-4 font-mono text-amber-800 font-bold whitespace-nowrap">
                                                    {new Date(log.checked_in_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.user?.username}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">{log.user?.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{log.user?.prodi || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${purp.color}`}>
                                                        {purp.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            Tidak ada log presensi kunjungan yang ditemukan.
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
