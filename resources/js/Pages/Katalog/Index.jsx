import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Search, Filter, MapPin, QrCode, ArrowLeft, LogIn, Sparkles } from 'lucide-react';

export default function Index({ books, categories, racks, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [rackId, setRackId] = useState(filters.rack_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/katalog', { search, category_id: categoryId, rack_id: rackId }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('');
        setRackId('');
        router.get('/katalog', {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
            <Head title="Katalog Publik - Penelusuran Koleksi Perpustakaan" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link href="/" className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-lg tracking-tight">Katalog Koleksi Perpustakaan</h1>
                            <p className="text-xs text-slate-500 font-medium">Penelusuran judul, lokasi rak fisik, dan ketersediaan stok</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {auth && auth.user ? (
                            <Link 
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'} 
                                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-full shadow transition-all"
                            >
                                Dashboard Saya
                            </Link>
                        ) : (
                            <Link href="/login" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow transition-all flex items-center space-x-1.5">
                                <LogIn className="w-4 h-4 stroke-[2.5]" />
                                <span>Masuk / Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Guest Banner */}
                {(!auth || !auth.user) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900 text-xs font-medium shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span>
                                <strong className="text-slate-950 font-extrabold">Mode Penelusuran Publik:</strong> Anda dapat melihat seluruh katalog dan lokasi rak fisik. Untuk meminjam buku & memindai barcode via HP, silakan masuk ke akun Anda.
                            </span>
                        </div>
                        <Link href="/login" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl shrink-0 text-xs shadow">
                            Login Meminjam Buku
                        </Link>
                    </div>
                )}

                {/* Search & Filter Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                        <Search className="w-4 h-4 text-amber-600" />
                        <span>Cari Koleksi Buku & Jurnal</span>
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
                                <option value="">Semua Rak</option>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.data && books.data.length > 0 ? (
                        books.data.map((book) => {
                            const isAvailable = book.available_copies_count > 0;
                            return (
                                <div key={book.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="bg-amber-100/80 text-amber-800 border border-amber-300/60 px-3 py-1 rounded-full text-[10px] font-bold">
                                                {book.category?.name}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                                isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {isAvailable ? `${book.available_copies_count} Tersedia` : 'Stok Habis'}
                                            </span>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            {book.cover_image ? (
                                                <img src={book.cover_image} alt={book.title} className="w-12 h-16 object-cover rounded-2xl border border-amber-200/60 shrink-0 group-hover:scale-105 transition-transform shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-16 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200/60 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <Link href={`/katalog/${book.id}`} className="font-extrabold text-slate-950 text-sm hover:text-amber-600 transition-colors line-clamp-2">
                                                    {book.title}
                                                </Link>
                                                <p className="text-xs text-slate-500 font-medium mt-1">Penulis: {book.author}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center space-x-1 text-slate-600 font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="font-mono text-xs font-bold text-slate-900">{book.rack?.code_rack}</span>
                                        </div>

                                        <Link
                                            href={`/katalog/${book.id}`}
                                            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
                                        >
                                            <span>Detail & Stok</span>
                                            <QrCode className="w-3.5 h-3.5" />
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
            </main>
        </div>
    );
}
