import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Search, Filter, MapPin, QrCode, Sparkles, BookMarked, Eye } from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function Index({ books, categories, racks, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [rackId, setRackId] = useState(filters.rack_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || '12');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/anggota/katalog', { search, category_id: categoryId, rack_id: rackId, per_page: perPage }, { preserveState: true });
    };

    const handlePerPageChange = (val) => {
        setPerPage(val);
        router.get('/anggota/katalog', { search, category_id: categoryId, rack_id: rackId, per_page: val }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('');
        setRackId('');
        setPerPage('12');
        router.get('/anggota/katalog', {}, { preserveState: true });
    };

    return (
        <AnggotaLayout activeMenu="catalog">
            <Head title="Katalog Koleksi Perpustakaan - Anggota" />

            <div className="space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Katalog Koleksi Perpustakaan</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Penelusuran judul, lokasi rak fisik, dan ketersediaan stok buku
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/anggota/scan"
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center space-x-2 shrink-0"
                        >
                            <QrCode className="w-4 h-4 stroke-[2.5]" />
                            <span>Scan Barcode Rak</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                        <Search className="w-4 h-4 text-amber-600" />
                        <span>Filter & Cari Koleksi Buku</span>
                    </h2>

                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ketik judul buku, nama pengarang, atau ISBN..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Kategori DDC</option>
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
                                <option value="">Semua Rak Fisik</option>
                                {racks.map((r) => (
                                    <option key={r.id} value={r.id}>{r.code_rack}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold shadow flex items-center justify-center space-x-1"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Cari</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Book Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.data && books.data.length > 0 ? (
                        books.data.map((book) => {
                            const isAvailable = book.available_copies_count > 0;
                            return (
                                <div key={book.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="bg-amber-100/80 text-amber-800 border border-amber-300/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[140px]">
                                                {book.category?.name}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                                isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {isAvailable ? `${book.available_copies_count} Tersedia` : 'Stok Habis'}
                                            </span>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            {book.cover_image ? (
                                                <img src={book.cover_image} alt={book.title} className="w-14 h-20 object-cover rounded-2xl border border-amber-200/60 shrink-0 group-hover:scale-105 transition-transform shadow-sm" />
                                            ) : (
                                                <div className="w-14 h-20 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200/60 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <Link href={`/anggota/katalog/${book.id}`} className="font-extrabold text-slate-950 text-xs sm:text-sm hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                                    {book.title}
                                                </Link>
                                                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Penulis: {book.author}</p>
                                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ISBN: {book.isbn || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center space-x-1 text-slate-600 font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="font-mono text-xs font-bold text-slate-900">{book.rack?.code_rack}</span>
                                        </div>

                                        <Link
                                            href={`/anggota/katalog/${book.id}`}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
                                        >
                                            <span>Detail & Stok</span>
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-500 font-medium space-y-2">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                            <p>Tidak ada koleksi buku yang cocok dengan pencarian Anda.</p>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-xs font-bold text-amber-600 hover:underline"
                            >
                                Reset Filter Pencarian
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{books.from || 0}</span> sampai{' '}
                        <span className="font-bold text-slate-900">{books.to || 0}</span> dari total{' '}
                        <span className="font-bold text-slate-900">{books.total || 0}</span> koleksi buku
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                            <span>Tampilkan:</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                                <option value="12">12 / hal</option>
                                <option value="24">24 / hal</option>
                                <option value="48">48 / hal</option>
                                <option value="96">96 / hal</option>
                                <option value="all">Semua Data</option>
                            </select>
                        </div>

                        {books.links && books.links.length > 3 && (
                            <div className="flex items-center space-x-1">
                                {books.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                : link.url
                                                ? 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnggotaLayout>
    );
}
