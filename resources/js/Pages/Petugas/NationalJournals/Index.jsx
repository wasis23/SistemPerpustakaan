import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import {
    BookMarked,
    Plus,
    Search,
    Edit3,
    Trash2,
    ExternalLink,
    FileSpreadsheet,
    Award,
    AlertCircle,
    Building2,
    Globe,
    CheckCircle2,
    XCircle,
    Layers,
    BookOpen,
    UploadCloud,
    Download,
    X,
    Sparkles,
    Calendar,
    FileText
} from 'lucide-react';

export default function NationalJournalsIndex({
    journals,
    filters = {},
    prodiList = [],
    nationalIndexings = [],
    internationalIndexings = [],
    stats = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeTab, setTypeTab] = useState(filters.type || ''); // '' = all, 'nasional', 'internasional', 'prosiding'
    const [prodiFilter, setProdiFilter] = useState(filters.prodi || '');
    const [sintaFilter, setSintaFilter] = useState(filters.sinta || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [journalToDelete, setJournalToDelete] = useState(null);

    // Bulk Import Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const { data: importData, setData: setImportData, post: postImport, processing: importing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({
            search,
            type: typeTab,
            prodi: prodiFilter,
            sinta: sintaFilter,
            status: statusFilter,
        });
    };

    const applyFilters = (params) => {
        router.get('/petugas/national-journals', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            search,
            type: typeTab,
            prodi: prodiFilter,
            sinta: sintaFilter,
            status: statusFilter,
            [key]: value,
        };
        if (key === 'type') setTypeTab(value);
        if (key === 'prodi') setProdiFilter(value);
        if (key === 'sinta') setSintaFilter(value);
        if (key === 'status') setStatusFilter(value);
        applyFilters(newFilters);
    };

    const handleToggleStatus = (journal) => {
        router.post(`/petugas/national-journals/${journal.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = (journal) => {
        setJournalToDelete(journal);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!journalToDelete) return;
        router.delete(`/petugas/national-journals/${journalToDelete.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setJournalToDelete(null);
            },
        });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;

        postImport('/petugas/national-journals/import-csv', {
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
        });
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Prosiding':
                return 'bg-amber-100 text-amber-950 border-amber-300 font-black';
            case 'Internasional':
                return 'bg-purple-100 text-purple-950 border-purple-300 font-black';
            default:
                return 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold';
        }
    };

    // Indexing Badge Colors
    const getIndexingBadgeClass = (indexing, type) => {
        if (type === 'Prosiding') return 'bg-amber-50 text-amber-900 border-amber-200 font-bold';
        if (!indexing) return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
        const lower = indexing.toLowerCase();

        if (lower.includes('q1') || lower.includes('q2')) {
            return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black';
        }
        if (lower.includes('q3') || lower.includes('q4') || lower.includes('scopus')) {
            return 'bg-blue-100 text-blue-950 border-blue-300 font-black';
        }
        if (lower.includes('wos') || lower.includes('doaj')) {
            return 'bg-indigo-100 text-indigo-950 border-indigo-300 font-extrabold';
        }
        if (lower.includes('sinta 1') || lower.includes('sinta 2')) {
            return 'bg-teal-100 text-teal-950 border-teal-300 font-black';
        }
        if (lower.includes('sinta 3') || lower.includes('sinta 4')) {
            return 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold';
        }
        if (lower.includes('sinta 5') || lower.includes('sinta 6')) {
            return 'bg-orange-100 text-orange-950 border-orange-300 font-bold';
        }
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    };

    return (
        <PetugasLayout activeMenu="national-journals">
            <Head title="Manajemen Publikasi Ilmiah (Jurnal & Prosiding) - SIMPUS Petugas" />

            <div className="space-y-8 w-full">
                {/* Header Title & Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            Publikasi Ilmiah
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-3xl">
                            Kelola pangkalan data direktori terpadu jurnal ilmiah nasional terakreditasi SINTA, jurnal internasional, dan prosiding seminar nasional.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-2"
                        >
                            <UploadCloud className="w-4 h-4 text-blue-600" />
                            <span>Input Masal (Impor File)</span>
                        </button>

                        <a
                            href={`/petugas/national-journals/export-csv?search=${encodeURIComponent(search)}&type=${encodeURIComponent(typeTab)}&prodi=${encodeURIComponent(prodiFilter)}&sinta=${encodeURIComponent(sintaFilter)}`}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-2"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Ekspor CSV</span>
                        </a>

                        <Link
                            href="/petugas/national-journals/create"
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Tambah Publikasi Baru</span>
                        </Link>
                    </div>
                </div>

                {/* Bulk Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-amber-900/10 shadow-2xl space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-950">Impor Masal Publikasi Ilmiah</h3>
                                        <p className="text-xs text-slate-500">Mendukung Jurnal Nasional, Jurnal Internasional & Prosiding Seminar</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowImportModal(false);
                                        resetImport();
                                    }}
                                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                Berkas CSV / Excel dapat memuat data <strong>Jurnal Nasional</strong>, <strong>Jurnal Internasional</strong>, maupun <strong>Prosiding Seminar</strong> (baik file format gabungan maupun file khusus prosiding). Sistem otomatis memetakan datanya dengan aman.
                            </p>

                            <form onSubmit={handleImportSubmit} className="space-y-4">
                                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-amber-50/50 transition-all cursor-pointer">
                                    <input
                                        type="file"
                                        id="import-national-journals-file"
                                        accept=".csv,.xlsx,.xls,.xlsm"
                                        onChange={(e) => setImportData('file', e.target.files[0])}
                                        className="hidden"
                                    />
                                    <label htmlFor="import-national-journals-file" className="cursor-pointer block space-y-2">
                                        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                                            <FileSpreadsheet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">
                                                {importData.file ? importData.file.name : 'Klik untuk memilih file Excel / CSV'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 block mt-0.5">
                                                {importData.file
                                                    ? `${(importData.file.size / 1024).toFixed(1)} KB`
                                                    : 'Format didukung: .csv, .xlsx, .xls (Maksimal 20 MB)'}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {importErrors.file && (
                                    <p className="text-xs font-bold text-rose-600">{importErrors.file}</p>
                                )}

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                    <a
                                        href="/petugas/national-journals/download-template"
                                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center space-x-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Unduh Format Template CSV</span>
                                    </a>

                                    <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowImportModal(false);
                                                resetImport();
                                            }}
                                            className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={importing || !importData.file}
                                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>{importing ? 'Mengimpor...' : 'Upload & Impor Data'}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-500">Total Publikasi</span>
                        <div className="text-2xl font-black text-slate-900">{stats.total || 0}</div>
                        <span className="text-[10px] text-slate-400 block font-medium">Semua direktori</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-blue-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-blue-700">Jurnal Nasional</span>
                        <div className="text-2xl font-black text-blue-600">{stats.nasional || 0}</div>
                        <span className="text-[10px] text-blue-600/70 block font-medium">Terbitan nasional</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-purple-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-purple-700">Jurnal Internasional</span>
                        <div className="text-2xl font-black text-purple-600">{stats.internasional || 0}</div>
                        <span className="text-[10px] text-purple-600/70 block font-medium">Terbitan global</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-amber-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-amber-700">Prosiding Seminar</span>
                        <div className="text-2xl font-black text-amber-600">{stats.prosiding || 0}</div>
                        <span className="text-[10px] text-amber-600/70 block font-medium">Kumpulan makalah</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-emerald-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-emerald-700">Akreditasi SINTA</span>
                        <div className="text-2xl font-black text-emerald-600">{stats.sinta_accredited || 0}</div>
                        <span className="text-[10px] text-emerald-600/70 block font-medium">SINTA 1 s/d 6</span>
                    </div>
                </div>

                {/* Tab Switcher: [Semua] | [Jurnal Nasional] | [Jurnal Internasional] | [Prosiding Seminar] */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl w-fit">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('type', '')}
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                            typeTab === ''
                                ? 'bg-white text-slate-950 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Semua ({stats.total || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterChange('type', 'nasional')}
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                            typeTab === 'nasional'
                                ? 'bg-white text-blue-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Jurnal Nasional ({stats.nasional || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterChange('type', 'internasional')}
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                            typeTab === 'internasional'
                                ? 'bg-white text-purple-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Jurnal Internasional ({stats.internasional || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterChange('type', 'prosiding')}
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                            typeTab === 'prosiding'
                                ? 'bg-white text-amber-950 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Prosiding Seminar ({stats.prosiding || 0})
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-900/10 shadow-sm space-y-4">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul jurnal, prosiding, program studi, penerbit, ISSN, atau tahun..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                            {/* Prodi Filter */}
                            <select
                                value={prodiFilter}
                                onChange={(e) => handleFilterChange('prodi', e.target.value)}
                                className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Semua Program Studi</option>
                                {prodiList.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Non-Aktif</option>
                            </select>

                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
                            >
                                Terapkan
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Data List */}
                <div className="bg-white rounded-3xl border border-amber-900/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                                    <th className="py-4 px-4 text-center w-12">No</th>
                                    <th className="py-4 px-3 text-center">Jenis</th>
                                    <th className="py-4 px-4">Program Studi</th>
                                    <th className="py-4 px-5 min-w-[220px]">Judul Publikasi</th>
                                    <th className="py-4 px-4 min-w-[150px]">Penerbit & Tahun</th>
                                    <th className="py-4 px-4 text-center">Link Akses</th>
                                    <th className="py-4 px-4 text-center">Akreditasi / Indeks</th>
                                    <th className="py-4 px-4 text-center font-mono">ISSN / e-ISSN</th>
                                    <th className="py-4 px-5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {journals.data && journals.data.length > 0 ? (
                                    journals.data.map((journal, index) => (
                                        <tr key={journal.id} className="hover:bg-amber-50/40 transition-colors">
                                            {/* 1. No */}
                                            <td className="py-4 px-4 text-center font-bold text-slate-400">
                                                {(journals.from || 1) + index}
                                            </td>

                                            {/* 2. Jenis */}
                                            <td className="py-4 px-3 text-center whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-md text-[10px] border ${getTypeBadgeClass(
                                                        journal.journal_type
                                                    )}`}
                                                >
                                                    {journal.journal_type || 'Nasional'}
                                                </span>
                                            </td>

                                            {/* 3. Program Studi */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[10px] inline-block max-w-[170px] truncate">
                                                    {journal.prodi}
                                                </span>
                                            </td>

                                            {/* 4. Judul */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <a
                                                        href={journal.access_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-black text-slate-900 hover:text-amber-600 transition-colors text-xs leading-snug line-clamp-2 block"
                                                    >
                                                        {journal.title}
                                                    </a>
                                                    {journal.frequency && (
                                                        <span className="text-[10px] text-slate-400 block">
                                                            {journal.frequency}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 5. Penerbit & Tahun */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="font-bold text-slate-800 text-xs block leading-tight">
                                                    {journal.publisher}
                                                </span>
                                                {journal.publish_year && (
                                                    <span className="text-[10px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span>Tahun {journal.publish_year}</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* 6. Link Akses */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <a
                                                    href={journal.access_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                                                    title={journal.access_url}
                                                >
                                                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>Buka Portal</span>
                                                    <ExternalLink className="w-3 h-3 text-amber-500" />
                                                </a>
                                            </td>

                                            {/* 7. Akreditasi / Indeksasi */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] border inline-block ${getIndexingBadgeClass(
                                                        journal.sinta,
                                                        journal.journal_type
                                                    )}`}
                                                >
                                                    {journal.journal_type === 'Prosiding'
                                                        ? 'Prosiding Seminar'
                                                        : journal.sinta}
                                                </span>
                                            </td>

                                            {/* 8. ISSN / e-ISSN */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {journal.e_issn ? (
                                                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded block">
                                                            e: {journal.e_issn}
                                                        </span>
                                                    ) : null}
                                                    {journal.issn ? (
                                                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block">
                                                            p: {journal.issn}
                                                        </span>
                                                    ) : null}
                                                    {!journal.issn && !journal.e_issn && (
                                                        <span className="text-slate-300 text-xs">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 9. Aksi */}
                                            <td className="py-4 px-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(journal)}
                                                        title={journal.is_active ? 'Non-aktifkan' : 'Aktifkan'}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            journal.is_active
                                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {journal.is_active ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>

                                                    <Link
                                                        href={`/petugas/national-journals/${journal.id}/edit`}
                                                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-all"
                                                        title="Edit Data"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(journal)}
                                                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-slate-400 space-y-3">
                                            <BookMarked className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300" />
                                            <p className="font-bold text-sm text-slate-600">Belum ada publikasi ilmiah yang terdaftar</p>
                                            <p className="text-xs text-slate-400">
                                                Silakan tambahkan data jurnal nasional, jurnal internasional, atau prosiding seminar.
                                            </p>
                                            <div className="pt-2 flex items-center justify-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowImportModal(true)}
                                                    className="px-4 py-2 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl text-xs inline-flex items-center space-x-2"
                                                >
                                                    <UploadCloud className="w-4 h-4" />
                                                    <span>Input Masal CSV</span>
                                                </button>
                                                <Link
                                                    href="/petugas/national-journals/create"
                                                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center space-x-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Tambah Publikasi Baru</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {journals.links && journals.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500 font-medium">
                                Menampilkan {journals.from || 0} - {journals.to || 0} dari total {journals.total || 0} publikasi
                            </div>

                            <div className="flex items-center space-x-1.5">
                                {journals.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 font-black'
                                                : link.url
                                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Delete Confirmation */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-amber-900/10">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-base text-slate-950">Hapus Publikasi Ilmiah?</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Data <strong>"{journalToDelete?.title}"</strong> ({journalToDelete?.prodi}) akan dihapus permanen dari pangkalan data perpustakaan.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                            >
                                Ya, Hapus Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
