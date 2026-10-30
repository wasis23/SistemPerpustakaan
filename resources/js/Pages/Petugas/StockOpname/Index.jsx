import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    FileSpreadsheet, 
    Download, 
    Search, 
    Filter, 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Layers, 
    MapPin, 
    Barcode,
    Hash
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function StockOpnameIndex({ copies, filters = {}, stats = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [collectionType, setCollectionType] = useState(filters.collection_type || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/stock-opname', {
            search,
            status,
            collection_type: collectionType,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setCollectionType('');
        router.get('/petugas/stock-opname', {}, { preserveState: true });
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'available':
                return { label: 'Tersedia di Rak', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'borrowed':
                return { label: 'Sedang Dipinjam', color: 'bg-amber-100 text-amber-800 border-amber-200' };
            case 'missing':
                return { label: 'Hilang', color: 'bg-rose-100 text-rose-800 border-rose-200' };
            case 'damaged':
                return { label: 'Rusak', color: 'bg-orange-100 text-orange-800 border-orange-200' };
            default:
                return { label: s, color: 'bg-slate-100 text-slate-800 border-slate-200' };
        }
    };

    return (
        <PetugasLayout activeMenu="stock-opname">
            <Head title="Stock Opname & Audit Inventaris Koleksi - Website Perpustakaan" />

            <div className="space-y-8 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-sm">
                                <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                                Stock Opname & Audit Inventaris
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Monitoring ketersediaan fisik seluruh eksemplar buku di rak dan unduh laporan audit lengkap
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/petugas/stock-opname/export-csv"
                            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
                            title="Unduh seluruh data inventaris dan eksemplar buku"
                        >
                            <Download className="w-4 h-4 stroke-[2.5]" />
                            <span>Unduh Semua Koleksi (CSV / Excel)</span>
                        </a>
                    </div>
                </div>

                {/* Key Metrics Cards - 4 Kolom */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                            <span>Total Eksemplar</span>
                            <Layers className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-950">{stats.total_copies ?? 0}</p>
                        <span className="text-[10px] text-slate-500 font-semibold block">{stats.total_titles ?? 0} Judul Buku</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
                            <span>Tersedia di Rak</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.available_copies ?? 0}</p>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Siap dipinjam</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase">
                            <span>Sedang Dipinjam</span>
                            <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-800">{stats.borrowed_copies ?? 0}</p>
                        <span className="text-[10px] text-amber-700 font-semibold block">Dalam masa sirkulasi</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-rose-600 text-xs font-bold uppercase">
                            <span>Hilang / Rusak</span>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-rose-600">
                            {(stats.missing_copies ?? 0) + (stats.damaged_copies ?? 0)}
                        </p>
                        <span className="text-[10px] text-rose-600 font-semibold block">
                            {stats.missing_copies ?? 0} Hilang • {stats.damaged_copies ?? 0} Rusak
                        </span>
                    </div>
                </div>

                {/* Filter Bar */}
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
                                placeholder="Cari judul, barcode, kode eksemplar, call number..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={collectionType}
                                onChange={(e) => setCollectionType(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Tipe Koleksi</option>
                                <option value="Buku Teks">Buku Teks</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Laporan PI/PKL">Laporan PI/PKL</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Status Fisik</option>
                                <option value="available">Tersedia di Rak</option>
                                <option value="borrowed">Sedang Dipinjam</option>
                                <option value="missing">Hilang</option>
                                <option value="damaged">Rusak</option>
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

                {/* Table Eksemplar Stock Opname */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                <tr>
                                    <th className="px-6 py-3.5">Kode Eksemplar & Barcode</th>
                                    <th className="px-6 py-3.5">Tipe & No Panggil</th>
                                    <th className="px-6 py-3.5">Judul Buku & Penulis</th>
                                    <th className="px-6 py-3.5">DDC & Rak</th>
                                    <th className="px-6 py-3.5 text-center">Status Fisik</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {copies.data && copies.data.length > 0 ? (
                                    copies.data.map((item) => {
                                        const badge = statusBadge(item.status);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block w-fit">
                                                        {item.copy_code}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                                        {item.barcode_hash}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                                                        {item.book?.collection_type || 'Buku Teks'}
                                                    </span>
                                                    <span className="text-[11px] font-mono font-black text-slate-900 block mt-1">
                                                        {item.book?.call_number || '-'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-950 line-clamp-1">{item.book?.title}</p>
                                                    <p className="text-[10px] text-slate-500">
                                                        {item.book?.author} • {item.book?.publish_year || '-'}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-[11px] font-extrabold text-slate-900 block">
                                                        DDC {item.book?.category?.code || '-'}
                                                    </span>
                                                    <span className="text-[10px] text-amber-800 font-bold flex items-center space-x-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{item.book?.rack?.code_rack || 'RAK-01'}</span>
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`inline-block border px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <Link
                                                        href={`/petugas/books/${item.book?.id}`}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[10px] transition-all"
                                                    >
                                                        Lihat Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            Belum ada data eksemplar koleksi untuk kriteria ini.
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
