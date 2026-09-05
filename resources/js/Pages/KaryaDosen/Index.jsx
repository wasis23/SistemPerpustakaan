import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    Search,
    Filter,
    ArrowLeft,
    LogIn,
    BookOpen,
    Building2,
    Calendar,
    Download,
    ExternalLink,
    Star,
    Layers,
    User,
    Sparkles,
    Hash,
    ChevronLeft,
    ChevronRight,
    Award
} from 'lucide-react';

export default function Index({ lecturerBooks, filters, prodiList, publicationTypes, availableYears, stats }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.prodi || '');
    const [publicationType, setPublicationType] = useState(filters.publication_type || '');
    const [publishYear, setPublishYear] = useState(filters.publish_year || '');
    const [featuredOnly, setFeaturedOnly] = useState(filters.featured_only || false);
    const [perPage, setPerPage] = useState(filters.per_page || '12');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/karya-dosen', {
            search,
            prodi,
            publication_type: publicationType,
            publish_year: publishYear,
            featured_only: featuredOnly ? '1' : '',
            per_page: perPage,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setProdi('');
        setPublicationType('');
        setPublishYear('');
        setFeaturedOnly(false);
        setPerPage('12');
        router.get('/karya-dosen', {}, { preserveState: true });
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Buku Ajar':
                return 'bg-blue-100/90 text-blue-900 border-blue-200';
            case 'Monograf':
                return 'bg-purple-100/90 text-purple-900 border-purple-200';
            case 'Buku Referensi':
                return 'bg-emerald-100/90 text-emerald-900 border-emerald-200';
            case 'Modul Praktikum':
                return 'bg-amber-100/90 text-amber-900 border-amber-200';
            case 'Book Chapter':
                return 'bg-rose-100/90 text-rose-900 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
            <Head title="Katalog Karya Buku Dosen - Politeknik Indonusa Surakarta" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/"
                            className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                            title="Kembali ke Beranda"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-1.5">
                                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Karya Buku & Publikasi Dosen</span>
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-full">
                                    {stats?.total || 0} Karya
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Repositori buku ajar, monograf, dan literatur akademik civitas Politeknik Indonusa</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/katalog"
                            className="hidden sm:inline-flex px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-amber-700 text-xs font-bold rounded-full transition-all"
                        >
                            Katalog Fisik
                        </Link>

                        {auth && auth.user ? (
                            <Link
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'}
                                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-full shadow transition-all"
                            >
                                Dashboard Saya
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow transition-all flex items-center space-x-1.5"
                            >
                                <LogIn className="w-4 h-4 stroke-[2.5]" />
                                <span>Masuk / Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Highlight Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Total Karya</p>
                            <p className="text-lg font-black text-slate-900">{stats?.total || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Buku Ajar</p>
                            <p className="text-lg font-black text-slate-900">{stats?.buku_ajar || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Monograf</p>
                            <p className="text-lg font-black text-slate-900">{stats?.monograf || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Buku Referensi</p>
                            <p className="text-lg font-black text-slate-900">{stats?.buku_referensi || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                            <Search className="w-4 h-4 text-amber-600" />
                            <span>Pencarian Karya & Publikasi Dosen</span>
                        </h2>
                    </div>

                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ketik judul buku, nama dosen/penulis, NIDN, atau ISBN..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={prodi}
                                onChange={(e) => setProdi(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Program Studi</option>
                                {prodiList.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <select
                                value={publicationType}
                                onChange={(e) => setPublicationType(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Jenis Karya</option>
                                {publicationTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-1">
                            <select
                                value={publishYear}
                                onChange={(e) => setPublishYear(e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Tahun</option>
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold shadow flex items-center justify-center space-x-1"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
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

                {/* Lecturer Books Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lecturerBooks.data && lecturerBooks.data.length > 0 ? (
                        lecturerBooks.data.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className={`px-2.5 py-1 font-black rounded-full text-[10px] border ${getTypeBadgeClass(book.publication_type)}`}>
                                            {book.publication_type}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full line-clamp-1 max-w-[160px]">
                                            {book.prodi}
                                        </span>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        {/* Stylized Book Cover */}
                                        <div className="w-16 h-22 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 overflow-hidden shadow-md shrink-0 flex flex-col items-center justify-center p-2 text-center relative border border-amber-600/30 group-hover:scale-105 transition-transform">
                                            {book.cover_image ? (
                                                <img
                                                    src={book.cover_image}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    <GraduationCap className="w-6 h-6 text-slate-950 mb-1" />
                                                    <span className="text-[8px] font-black leading-tight text-slate-950 line-clamp-2 uppercase">
                                                        {book.publication_type}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <Link
                                                href={`/karya-dosen/${book.slug || book.id}`}
                                                className="font-extrabold text-sm text-slate-950 hover:text-amber-600 transition-colors line-clamp-2 leading-snug"
                                            >
                                                {book.title}
                                            </Link>
                                            <p className="text-xs text-slate-600 font-semibold line-clamp-1 flex items-center space-x-1">
                                                <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                                <span>{book.authors}</span>
                                            </p>
                                            {book.nidn && (
                                                <p className="text-[10px] font-mono text-slate-400">
                                                    NIDN: {book.nidn}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Meta details */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Penerbit: <strong className="text-slate-700">{book.publisher || '-'}</strong></span>
                                        <span>Tahun: <strong className="text-slate-700">{book.publish_year || '-'}</strong></span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5">
                                        {book.isbn && (
                                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                ISBN: {book.isbn}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={`/karya-dosen/${book.slug || book.id}`}
                                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                                    >
                                        <span>Detail Karya</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-950">Tidak ada karya buku dosen ditemukan</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Coba sesuaikan kata kunci pencarian, pilihan program studi, atau klik tombol Reset filter.
                            </p>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold shadow"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {lecturerBooks.links && lecturerBooks.links.length > 3 && (
                    <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium pl-2">
                            Menampilkan {lecturerBooks.from || 0} - {lecturerBooks.to || 0} dari {lecturerBooks.total} karya
                        </span>
                        <div className="flex items-center space-x-1">
                            {lecturerBooks.links.map((link, idx) => {
                                if (link.url === null) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 text-xs text-slate-400 font-medium rounded-xl border border-transparent cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveState
                                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 shadow'
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-12 text-center text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
                    <p>© {new Date().getFullYear()} UPT Perpustakaan Politeknik Indonusa Surakarta. Repositori Karya Ilmiah & Buku Dosen.</p>
                </div>
            </footer>
        </div>
    );
}
