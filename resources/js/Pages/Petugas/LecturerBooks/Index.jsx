import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import {
    GraduationCap,
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    Star,
    Calendar,
    BookOpen,
    Download,
    FileSpreadsheet,
    FileText,
    ExternalLink,
    AlertCircle,
    Award,
    CheckCircle2,
    Sparkles,
    Building2,
    Hash,
    UploadCloud,
    X
} from 'lucide-react';

export default function LecturerBooksIndex({
    lecturerBooks,
    filters = {},
    prodiList = [],
    publicationTypes = [],
    availableYears = [],
    stats = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [prodiFilter, setProdiFilter] = useState(filters.prodi || '');
    const [typeFilter, setTypeFilter] = useState(filters.publication_type || '');
    const [yearFilter, setYearFilter] = useState(filters.publish_year || '');
    const [featuredOnly, setFeaturedOnly] = useState(filters.featured_only === 'true' || filters.featured_only === true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);

    // Bulk Import Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const { data: importData, setData: setImportData, post: postImport, processing: importing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({
            search,
            prodi: prodiFilter,
            publication_type: typeFilter,
            publish_year: yearFilter,
            featured_only: featuredOnly ? '1' : '',
        });
    };

    const applyFilters = (params) => {
        router.get('/petugas/lecturer-books', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            search,
            prodi: prodiFilter,
            publication_type: typeFilter,
            publish_year: yearFilter,
            featured_only: featuredOnly ? '1' : '',
            [key]: value,
        };
        if (key === 'prodi') setProdiFilter(value);
        if (key === 'publication_type') setTypeFilter(value);
        if (key === 'publish_year') setYearFilter(value);
        if (key === 'featured_only') setFeaturedOnly(value);
        applyFilters(newFilters);
    };

    const handleToggleFeatured = (book) => {
        router.post(`/petugas/lecturer-books/${book.id}/toggle-featured`, {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = (book) => {
        setBookToDelete(book);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!bookToDelete) return;
        router.delete(`/petugas/lecturer-books/${bookToDelete.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setBookToDelete(null);
            },
        });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;

        postImport('/petugas/lecturer-books/import-csv', {
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
        });
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Buku Ajar':
                return 'bg-blue-100 text-blue-900 border-blue-200';
            case 'Monograf':
                return 'bg-purple-100 text-purple-900 border-purple-200';
            case 'Buku Referensi':
                return 'bg-emerald-100 text-emerald-900 border-emerald-200';
            case 'Modul Praktikum':
                return 'bg-amber-100 text-amber-900 border-amber-200';
            case 'Book Chapter':
                return 'bg-rose-100 text-rose-900 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <PetugasLayout activeMenu="lecturer-books">
            <Head title="Manajemen Karya Buku Dosen - SIMPUS Petugas" />

            <div className="space-y-8 w-full">
                {/* Header Title & Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-900 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Repositori Karya Akademik & Intelektual Dosen</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            Karya Buku Dosen
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-3xl">
                            Kelola data publikasi buku ajar, monograf, buku referensi, dan modul praktikum karya dosen Politeknik Indonusa Surakarta (terpisah dari katalog sirkulasi fisik).
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
                            href={`/petugas/lecturer-books/export-csv?search=${encodeURIComponent(search)}&prodi=${encodeURIComponent(prodiFilter)}&publication_type=${encodeURIComponent(typeFilter)}&publish_year=${encodeURIComponent(yearFilter)}`}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-2"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Ekspor CSV</span>
                        </a>

                        <Link
                            href="/petugas/lecturer-books/create"
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Tambah Karya Buku</span>
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
                                        <h3 className="text-base font-black text-slate-950">Impor Masal Karya Buku Dosen</h3>
                                        <p className="text-xs text-slate-500">Unggah berkas spreadsheet CSV / Excel data buku dosen</p>
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
                                Fitur ini digunakan untuk memasukkan puluhan hingga ratusan data buku ajar, monograf, dan referensi karya dosen sekaligus tanpa input satu per satu.
                            </p>

                            <form onSubmit={handleImportSubmit} className="space-y-4">
                                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-amber-50/50 transition-all cursor-pointer">
                                    <input
                                        type="file"
                                        id="import-lecturer-books-file"
                                        accept=".csv,.xlsx,.xls,.xlsm"
                                        onChange={(e) => setImportData('file', e.target.files[0])}
                                        className="hidden"
                                    />
                                    <label htmlFor="import-lecturer-books-file" className="cursor-pointer block space-y-2">
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
                                        href="/petugas/lecturer-books/download-template"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-500">Total Karya</span>
                        <div className="text-2xl font-black text-slate-900">{stats.total || 0}</div>
                        <span className="text-[10px] text-slate-400 block font-medium">Buku terdaftar</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-blue-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-blue-700">Buku Ajar</span>
                        <div className="text-2xl font-black text-blue-600">{stats.buku_ajar || 0}</div>
                        <span className="text-[10px] text-blue-600/70 block font-medium">Pedoman kuliah</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-purple-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-purple-700">Monograf</span>
                        <div className="text-2xl font-black text-purple-600">{stats.monograf || 0}</div>
                        <span className="text-[10px] text-purple-600/70 block font-medium">Hasil riset dosen</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-emerald-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-emerald-700">Buku Referensi</span>
                        <div className="text-2xl font-black text-emerald-600">{stats.buku_referensi || 0}</div>
                        <span className="text-[10px] text-emerald-600/70 block font-medium">Koleksi rujukan</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-amber-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-amber-700">Modul Praktikum</span>
                        <div className="text-2xl font-black text-amber-600">{stats.modul_praktikum || 0}</div>
                        <span className="text-[10px] text-amber-600/70 block font-medium">Panduan lab/bengkel</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-rose-500/20 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-rose-700">Hak Cipta / HKI</span>
                        <div className="text-2xl font-black text-rose-600">{stats.with_hki || 0}</div>
                        <span className="text-[10px] text-rose-600/70 block font-medium">Tersertifikasi HKI</span>
                    </div>
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
                                placeholder="Cari judul buku, nama dosen penulis, NIDN, ISBN, penerbit, atau nomor HKI..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                            {/* Prodi Dropdown Filter */}
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

                            {/* Publication Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => handleFilterChange('publication_type', e.target.value)}
                                className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Semua Jenis Karya</option>
                                {publicationTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>

                            {/* Year Filter */}
                            <select
                                value={yearFilter}
                                onChange={(e) => handleFilterChange('publish_year', e.target.value)}
                                className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Semua Tahun</option>
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>

                            {/* Featured Star Toggle */}
                            <button
                                type="button"
                                onClick={() => handleFilterChange('featured_only', !featuredOnly)}
                                className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all flex items-center space-x-1.5 ${
                                    featuredOnly
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-purple-600 text-purple-600' : 'text-slate-400'}`} />
                                <span>Unggulan</span>
                            </button>

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
                                    <th className="py-4 px-5">Judul Buku & Karya</th>
                                    <th className="py-4 px-4">Dosen Penulis / NIDN</th>
                                    <th className="py-4 px-4">Program Studi</th>
                                    <th className="py-4 px-4 text-center">Jenis Karya</th>
                                    <th className="py-4 px-4">Penerbit & Tahun</th>
                                    <th className="py-4 px-4 text-center">Legalitas / HKI</th>
                                    <th className="py-4 px-5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lecturerBooks.data && lecturerBooks.data.length > 0 ? (
                                    lecturerBooks.data.map((book) => (
                                        <tr key={book.id} className="hover:bg-amber-50/40 transition-colors">
                                            {/* Cover & Title */}
                                            <td className="py-4 px-5 max-w-sm">
                                                <div className="flex items-start space-x-3.5">
                                                    <div className="w-14 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                                                        {book.cover_image ? (
                                                            <img
                                                                src={book.cover_image}
                                                                alt={book.title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <BookOpen className="w-6 h-6 stroke-[1.5]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Link
                                                            href={`/petugas/lecturer-books/${book.id}`}
                                                            className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 text-xs sm:text-sm block"
                                                        >
                                                            {book.title}
                                                        </Link>
                                                        {book.edition && (
                                                            <span className="text-[10px] text-slate-400 block font-medium">
                                                                {book.edition} {book.pages ? `• ${book.pages} hlm` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Authors & NIDN */}
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <p className="font-extrabold text-slate-800 line-clamp-2 text-xs">
                                                        {book.authors}
                                                    </p>
                                                    {book.nidn && (
                                                        <span className="text-[10px] font-mono text-slate-500 block">
                                                            NIDN: {book.nidn}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Program Studi */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[10px] block truncate max-w-[170px]">
                                                    {book.prodi}
                                                </span>
                                            </td>

                                            {/* Publication Type */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <span className={`px-2.5 py-1 font-extrabold rounded-full text-[10px] border inline-block ${getTypeBadgeClass(book.publication_type)}`}>
                                                    {book.publication_type}
                                                </span>
                                            </td>

                                            {/* Publisher & Year */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-slate-800 block text-[11px] truncate max-w-[150px]">
                                                        {book.publisher || 'Penerbit Mandiri'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Tahun {book.publish_year || '-'}</span>
                                                        {book.city ? `(${book.city})` : ''}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* ISBN & HKI / Digital Links */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {book.isbn ? (
                                                        <div className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                            ISBN: {book.isbn}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300">-</span>
                                                    )}

                                                    {book.hki_number && (
                                                        <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                            <Award className="w-3 h-3" />
                                                            <span>HKI Terdaftar</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-4 px-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleFeatured(book)}
                                                        title={book.is_featured ? 'Hapus dari karya unggulan' : 'Jadikan karya unggulan'}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            book.is_featured
                                                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${book.is_featured ? 'fill-purple-600' : ''}`} />
                                                    </button>

                                                    <Link
                                                        href={`/petugas/lecturer-books/${book.id}`}
                                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                                                        title="Detail Karya"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>

                                                    <Link
                                                        href={`/petugas/lecturer-books/${book.id}/edit`}
                                                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-all"
                                                        title="Edit Data Buku"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(book)}
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
                                        <td colSpan="7" className="py-12 text-center text-slate-400 space-y-3">
                                            <GraduationCap className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300" />
                                            <p className="font-bold text-sm text-slate-600">Belum ada karya buku dosen yang terdaftar</p>
                                            <p className="text-xs text-slate-400">
                                                Silakan tambahkan data buku ajar, monograf, atau modul praktikum karya dosen.
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
                                                    href="/petugas/lecturer-books/create"
                                                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center space-x-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Tambah Karya Baru</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {lecturerBooks.links && lecturerBooks.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500 font-medium">
                                Menampilkan {lecturerBooks.from || 0} - {lecturerBooks.to || 0} dari total {lecturerBooks.total || 0} karya buku
                            </div>

                            <div className="flex items-center space-x-1.5">
                                {lecturerBooks.links.map((link, idx) => (
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
                                <h3 className="font-extrabold text-base text-slate-950">Hapus Karya Buku Dosen?</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Data karya <strong>"{bookToDelete?.title}"</strong> oleh <em>{bookToDelete?.authors}</em> akan dihapus permanen dari repositori perpustakaan.
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
