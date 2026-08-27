import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Plus, Search, Filter, Printer, FileText, ArrowLeft, Eye, Trash2, Edit, CheckCircle2, AlertCircle } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ books, categories, racks, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [rackId, setRackId] = useState(filters.rack_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [showImportModal, setShowImportModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const { data: importData, setData: setImportData, post: postImport, processing: importing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const handleResetAll = () => {
        setIsResetting(true);
        router.delete('/petugas/books/reset-all', {
            onFinish: () => {
                setIsResetting(false);
                setShowResetModal(false);
            },
        });
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/petugas/books', { search, category_id: categoryId, rack_id: rackId, per_page: perPage }, { preserveState: true });
    };

    const handlePerPageChange = (val) => {
        setPerPage(val);
        router.get('/petugas/books', { search, category_id: categoryId, rack_id: rackId, per_page: val }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('');
        setRackId('');
        setPerPage('10');
        router.get('/petugas/books', {}, { preserveState: true });
    };

    const handleDelete = (id, title) => {
        if (confirm(`Apakah Anda yakin ingin menghapus buku "${title}" beserta seluruh eksemplarnya?`)) {
            router.delete(`/petugas/books/${id}`);
        }
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) {
            alert('Silakan pilih file CSV/Excel terlebih dahulu.');
            return;
        }

        postImport('/petugas/books/import-csv', {
            forceFormData: true,
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
        });
    };

    return (
        <PetugasLayout activeMenu="books">
            <Head title="Manajemen Katalog Buku - Petugas" />

            <div className="space-y-6 w-full">
                {/* Page Title Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Manajemen Katalog Buku</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Pengelolaan koleksi & eksemplar fisik berperekat barcode</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a
                            href="/petugas/books/download-template"
                            className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-2xl text-xs font-bold text-emerald-800 transition-all flex items-center space-x-1.5 shadow-sm"
                            title="Unduh file contoh format Stock Opname CSV"
                        >
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span>Download Template CSV</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-amber-500 rounded-2xl text-xs font-bold text-slate-700 hover:text-amber-700 transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                            <FileText className="w-4 h-4 text-amber-600" />
                            <span>Impor File (Excel/CSV)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowResetModal(true)}
                            className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                            title="Hapus dan bersihkan semua data buku dari sistem"
                        >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>Reset Semua Buku</span>
                        </button>

                        <Link
                            href="/petugas/books/create"
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Tambah Judul Buku</span>
                        </Link>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Reset All Books Confirmation Modal */}
                {showResetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                <Trash2 className="w-6 h-6 stroke-[2.5]" />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-black text-slate-950">Reset Seluruh Katalog Buku?</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Apakah Anda yakin ingin <strong className="text-rose-600 font-bold">menghapus SEMUA data buku</strong> dan seluruh eksemplar fisik di perpustakaan?
                                </p>
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left text-[11px] text-rose-800 font-medium space-y-1">
                                    <p className="font-bold flex items-center space-x-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 inline shrink-0" />
                                        <span>Dampak Tindakan:</span>
                                    </p>
                                    <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                                        <li>Semua judul buku dan eksemplar fisik akan terhapus.</li>
                                        <li>Riwayat sirkulasi & tiket buku akan dibersihkan.</li>
                                        <li>Kategori DDC dan Lokasi Rak tetap tersimpan.</li>
                                        <li>Tindakan ini permanen dan tidak dapat dibatalkan.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    disabled={isResetting}
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={isResetting}
                                    onClick={handleResetAll}
                                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{isResetting ? 'Sedang Mereset...' : 'Ya, Hapus Semua'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Import File Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-amber-900/10 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-extrabold text-slate-950">Impor Massal Katalog Buku</h3>
                                <a
                                    href="/petugas/books/download-template"
                                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Unduh Template CSV</span>
                                </a>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                Unggah dokumen Excel (<code>.xlsm</code>, <code>.xlsx</code>, <code>.xls</code>) atau file <code>.csv</code> berisi data Stock Opname.
                            </p>

                            <form onSubmit={handleImportSubmit} className="space-y-4">
                                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-amber-50/50 transition-all cursor-pointer">
                                    <input
                                        type="file"
                                        id="import-file-input"
                                        accept=".csv,.xlsx,.xls,.xlsm"
                                        onChange={(e) => setImportData('file', e.target.files[0])}
                                        className="hidden"
                                    />
                                    <label htmlFor="import-file-input" className="cursor-pointer block space-y-2">
                                        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">
                                                {importData.file ? importData.file.name : 'Klik untuk memilih file Excel / CSV'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 block mt-0.5">
                                                {importData.file
                                                    ? `${(importData.file.size / 1024).toFixed(1)} KB`
                                                    : 'Format didukung: .xlsm, .xlsx, .xls, .csv (Maksimal 20 MB)'}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {importErrors.file && (
                                    <p className="text-xs font-bold text-rose-600">{importErrors.file}</p>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                    <a
                                        href="/petugas/books/download-template"
                                        className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                                    >
                                        Unduh Format Template
                                    </a>

                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowImportModal(false);
                                                resetImport();
                                            }}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={importing || !importData.file}
                                            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow transition-all"
                                        >
                                            {importing ? 'Mengunggah & Memproses...' : 'Upload & Impor Buku'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filter Form */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Judul, Pengarang, atau ISBN..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <select
                                value={rackId}
                                onChange={(e) => setRackId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Rak</option>
                                {racks.map((r) => (
                                    <option key={r.id} value={r.id}>{r.code_rack}</option>
                                ))}
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

                {/* Book Catalog Table - Full Width */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                <tr>
                                    <th className="px-6 py-3.5">Detail Buku</th>
                                    <th className="px-6 py-3.5">Kategori & Rak</th>
                                    <th className="px-6 py-3.5 text-center">Stok Eksemplar</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {books.data && books.data.length > 0 ? (
                                    books.data.map((book) => (
                                        <tr key={book.id} className="hover:bg-slate-50/80 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start space-x-3">
                                                    {book.cover_image ? (
                                                        <img src={book.cover_image} alt={book.title} className="w-10 h-14 object-cover rounded-xl border border-amber-200 shrink-0 shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-14 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link href={`/petugas/books/${book.id}`} className="font-extrabold text-slate-950 text-sm hover:text-amber-700 transition-colors line-clamp-1">
                                                            {book.title}
                                                        </Link>
                                                        <p className="text-slate-600 text-xs font-medium mt-0.5">Penulis: {book.author}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-slate-500 font-mono">ISBN: {book.isbn || '-'}</span>
                                                            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                                                                🏷️ {book.call_number || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <span className="inline-block bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        {book.category?.name || 'Umum'}
                                                    </span>
                                                    <p className="text-[11px] text-slate-600 font-mono font-medium">
                                                        📍 {book.rack?.code_rack} ({book.rack?.location})
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                                                    <span className="font-extrabold text-emerald-700">{book.available_copies_count}</span>
                                                    <span className="text-slate-400">/</span>
                                                    <span className="font-bold text-slate-700">{book.copies_count} Eksemplar</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/petugas/books/${book.id}`}
                                                        className="p-2 text-slate-700 hover:text-amber-700 bg-slate-100 rounded-xl transition-all"
                                                        title="Lihat Detail & Eksemplar"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/petugas/books/${book.id}/print-barcodes`}
                                                        target="_blank"
                                                        className="p-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl transition-all"
                                                        title="Cetak Label Barcode"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(book.id, book.title)}
                                                        className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 rounded-xl transition-all"
                                                        title="Hapus Buku"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            Belum ada data buku dalam katalog.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-slate-500 font-medium">
                            Menampilkan <span className="font-bold text-slate-900">{books.from || 0}</span> sampai{' '}
                            <span className="font-bold text-slate-900">{books.to || 0}</span> dari total{' '}
                            <span className="font-bold text-slate-900">{books.total || 0}</span> judul buku
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Per Page Selector */}
                            <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                                <span>Tampilkan:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                                >
                                    <option value="10">10 / hal</option>
                                    <option value="25">25 / hal</option>
                                    <option value="50">50 / hal</option>
                                    <option value="100">100 / hal</option>
                                    <option value="all">Semua Data</option>
                                </select>
                            </div>

                            {/* Pagination Links */}
                            {books.links && books.links.length > 3 && (
                                <div className="flex items-center space-x-1">
                                    {books.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                                                link.active
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                    : link.url
                                                    ? 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 shadow-sm'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
