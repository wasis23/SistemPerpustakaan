import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    Search,
    Clock,
    Calendar,
    User,
    ArrowRight,
    Sparkles,
    Eye,
    ChevronRight,
    Star,
    Tag,
    Share2,
    SlidersHorizontal,
    Monitor
} from 'lucide-react';

export default function BeritaIndex({ posts, featuredPosts = [], categories = [], filters = {} }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/berita', {
            search,
            category: selectedCategory,
        }, {
            preserveState: true,
        });
    };

    const handleCategoryClick = (catName) => {
        const nextCategory = selectedCategory === catName ? '' : catName;
        setSelectedCategory(nextCategory);
        router.get('/berita', {
            search,
            category: nextCategory,
        }, {
            preserveState: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950">
            <Head>
                <title>Kabar & Berita Perpustakaan - Politeknik Indonusa Surakarta</title>
                <meta name="description" content="Pusat informasi, pengumuman resmi, kegiatan literasi, dan kabar koleksi buku terbaru dari perpustakaan digital Politeknik Indonusa Surakarta." />
                <meta name="keywords" content="berita perpustakaan, pengumuman poltekindonusa, literasi digital, jadwal simpus, buku baru" />
            </Head>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-all">
                            <BookOpen className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                                SIMPUS<span className="text-amber-600">.</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                                Politeknik Indonusa Surakarta
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
                        <Link href="/" className="hover:text-amber-600 transition-colors">
                            Beranda
                        </Link>
                        <Link href="/katalog" className="hover:text-amber-600 transition-colors">
                            Katalog Buku
                        </Link>
                        <Link href="/berita" className="text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5">
                            Berita & Pengumuman
                        </Link>
                        <Link href="/presensi" target="_blank" className="hover:text-amber-600 transition-colors flex items-center space-x-1">
                            <Monitor className="w-4 h-4 text-amber-500" />
                            <span>Presensi</span>
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-3">
                        {auth && auth.user ? (
                            <Link
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-full shadow-lg transition-all flex items-center space-x-2 border border-slate-700"
                            >
                                <span>Dashboard Saya</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                            >
                                <span>Portal Anggota</span>
                                <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center">
                                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Header Hero Section */}
            <section className="py-12 sm:py-16 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                        Warta Perpustakaan Digital
                    </h1>

                    <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
                        Ikuti perkembangan program layanan, penambahan koleksi referensi akademik, tips literasi ilmiah, dan agenda kegiatan Politeknik Indonusa Surakarta.
                    </p>

                    {/* Search & Category Filter Box */}
                    <div className="max-w-2xl mx-auto pt-4">
                        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white p-2 rounded-3xl border border-slate-200 shadow-md">
                            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari topik, pengumuman, atau artikel..."
                                className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-2xl transition-all shrink-0"
                            >
                                Cari Berita
                            </button>
                        </form>

                        {/* Category Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    !selectedCategory
                                        ? 'bg-slate-950 text-amber-400 shadow-sm'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Semua Topik
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.category}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat.category)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        selectedCategory === cat.category
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    <span>{cat.category}</span>
                                    <span className="ml-1.5 opacity-60 text-[10px]">({cat.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Featured Posts (Only if no filters applied and featured exist) */}
                {!search && !selectedCategory && featuredPosts && featuredPosts.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                                Berita Pilihan & Sorotan Utama
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/berita/${post.slug}`}
                                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-full h-52 bg-slate-100 relative overflow-hidden">
                                            <img
                                                src={post.thumbnail || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'}
                                                alt={post.thumbnail_alt || post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />
                                            <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                                                {post.category}
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium">
                                                <span className="flex items-center space-x-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center space-x-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{post.reading_time || 2} min baca</span>
                                                </span>
                                            </div>

                                            <h3 className="font-black text-base sm:text-lg text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>

                                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                                {post.excerpt || post.meta_description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                                        <span>Baca Selengkapnya</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Article Grid List */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                            {selectedCategory ? `Kategori: ${selectedCategory}` : 'Semua Berita & Artikel'}
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                            Ditemukan {posts.total || 0} artikel terbit
                        </span>
                    </div>

                    {posts.data && posts.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {posts.data.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/berita/${post.slug}`}
                                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
                                            <img
                                                src={post.thumbnail || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'}
                                                alt={post.thumbnail_alt || post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />
                                            <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                                                {post.category}
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium">
                                                <span className="flex items-center space-x-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center space-x-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{post.reading_time || 2} min</span>
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center space-x-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>{post.view_count || 0}</span>
                                                </span>
                                            </div>

                                            <h3 className="font-extrabold text-base text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>

                                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                                {post.excerpt || post.meta_description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-700">
                                        <span>Baca Artikel</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                            <BookOpen className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300" />
                            <p className="font-bold text-sm text-slate-700">Tidak ada artikel ditemukan</p>
                            <p className="text-xs text-slate-400">
                                Coba gunakan kata kunci pencarian yang lain atau pilih kategori berbeda.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="pt-6 flex items-center justify-center space-x-2">
                            {posts.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                                        link.active
                                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                            : link.url
                                            ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                            : 'text-slate-300 cursor-not-allowed bg-transparent'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Public Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                            <BookOpen className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="font-extrabold text-white text-base">SIMPUS Politeknik Indonusa Surakarta</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Sistem Informasi Manajemen Perpustakaan Digital Berbasis Self-Service & Optimasi Akses Literasi Ilmiah.
                    </p>
                    <p className="text-[11px] text-slate-600">
                        &copy; {new Date().getFullYear()} Politeknik Indonusa Surakarta. Hak Cipta Dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
