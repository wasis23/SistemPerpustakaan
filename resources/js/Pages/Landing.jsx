import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    QrCode,
    Search,
    Clock,
    ArrowRight,
    Sparkles,
    Monitor,
    ChevronRight,
    Cpu,
    HeartPulse,
    Globe,
    Scale,
    FileCode,
    Lock,
    ShieldCheck,
    Layers,
    BookMarked,
    Library,
    Compass,
    ExternalLink
} from 'lucide-react';

export default function Landing({ featuredBooks, categories, libraries, stats }) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/katalog?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    // Pastel icon styles for DDC Categories
    const categoryStyles = [
        { bg: 'bg-amber-100/90 text-amber-800', icon: Cpu, border: 'hover:border-amber-400' },
        { bg: 'bg-emerald-100/90 text-emerald-800', icon: HeartPulse, border: 'hover:border-emerald-400' },
        { bg: 'bg-indigo-100/90 text-indigo-800', icon: FileCode, border: 'hover:border-indigo-400' },
        { bg: 'bg-purple-100/90 text-purple-800', icon: Globe, border: 'hover:border-purple-400' },
        { bg: 'bg-rose-100/90 text-rose-800', icon: Scale, border: 'hover:border-rose-400' },
        { bg: 'bg-cyan-100/90 text-cyan-800', icon: BookOpen, border: 'hover:border-cyan-400' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans">
            <Head title="SIMPUS - Perpustakaan Digital Politeknik Indonusa Surakarta" />

            {/* 1. TOP NAVIGATION BAR */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-all">
                            <BookOpen className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                                SIMPUS<span className="text-amber-600">.</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                                UPT Perpustakaan Polindo
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
                        <Link href="/" className="text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5">
                            Beranda
                        </Link>
                        <Link href="/katalog" className="hover:text-amber-600 transition-colors">
                            Katalog Buku
                        </Link>
                        <Link href="#kategori" className="hover:text-amber-600 transition-colors">
                            Kategori DDC
                        </Link>
                        <Link href="/presensi" target="_blank" className="hover:text-amber-600 transition-colors flex items-center space-x-1">
                            <Monitor className="w-4 h-4 text-amber-500" />
                            <span>Kios Presensi</span>
                        </Link>
                        <Link href="#fitur" className="hover:text-amber-600 transition-colors">
                            Keunggulan
                        </Link>
                    </nav>

                    {/* Right CTA Actions */}
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/katalog"
                            className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
                            title="Cari Katalog"
                        >
                            <Search className="w-5 h-5" />
                        </Link>

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

            {/* 2. HERO SECTION */}
            <section className="relative pt-12 pb-16 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Hero Text Column */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-amber-800 font-semibold text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Self-Service Digital Circulation System</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                                Pinjam Cepat.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">
                                    Belajar Lebih Banyak.
                                </span>
                            </h1>

                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                                Layanan perpustakaan digital Politeknik Indonusa Surakarta. Pindai barcode buku di depan rak menggunakan kamera HP, dapatkan tiket digital 5 menit, dan bebas antre di meja pustakawan.
                            </p>

                            {/* Hero Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Link
                                    href={auth && auth.user ? "/anggota/scan" : "/login"}
                                    className="px-7 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded-full shadow-xl transition-all flex items-center space-x-2.5"
                                >
                                    <QrCode className="w-4 h-4 text-amber-400" />
                                    <span>Pindai Buku di Rak HP</span>
                                </Link>

                                <Link
                                    href="/katalog"
                                    className="px-7 py-3.5 bg-white border border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-800 font-bold text-sm rounded-full shadow-sm hover:shadow transition-all"
                                >
                                    Jelajahi Katalog Buku
                                </Link>
                            </div>
                        </div>

                        {/* Right Hero Decorative Stack Artwork: Perpustakaan 360° */}
                        <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-md">
                                {/* Ambient Warm Glow Background */}
                                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-400/30 via-orange-300/20 to-amber-500/20 rounded-3xl blur-2xl -z-10" />

                                {/* Elegant Perpustakaan 360 Box */}
                                <div className="bg-white p-8 rounded-3xl border border-amber-900/10 shadow-2xl space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center space-x-2">
                                            <Library className="w-5 h-5 text-amber-600" />
                                            <span className="font-bold text-xs text-slate-900">Perpustakaan 360°</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                                            Virtual Tour
                                        </span>
                                    </div>

                                    {/* Stacked Perpustakaan 360° Items */}
                                    <div className="space-y-3 pt-1">
                                        {libraries && libraries.length > 0 ? (
                                            libraries.slice(0, 3).map((lib, idx) => {
                                                const styles = [
                                                    {
                                                        card: 'bg-slate-950 text-white',
                                                        subtext: 'text-amber-400',
                                                        title: 'text-white',
                                                        btn: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
                                                    },
                                                    {
                                                        card: 'bg-amber-600 text-slate-950',
                                                        subtext: 'text-amber-950 font-semibold',
                                                        title: 'text-slate-950 font-black',
                                                        btn: 'bg-slate-950 hover:bg-slate-800 text-amber-300',
                                                    },
                                                    {
                                                        card: 'bg-emerald-800 text-white',
                                                        subtext: 'text-emerald-300',
                                                        title: 'text-white',
                                                        btn: 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950',
                                                    },
                                                ];
                                                const style = styles[idx % styles.length];

                                                return (
                                                    <div
                                                        key={lib.id}
                                                        className={`p-4 rounded-2xl ${style.card} flex items-center justify-between shadow-md transform hover:-translate-y-1 transition-transform`}
                                                    >
                                                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                                                <Compass className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                {/* 1. Nama Perpustakaan / Ruang Baca */}
                                                                <p className={`font-extrabold text-xs sm:text-sm ${style.title} line-clamp-1`}>
                                                                    {lib.name}
                                                                </p>
                                                                {/* 2. Deskripsi / Fasilitas */}
                                                                <p className={`text-[10px] sm:text-xs ${style.subtext} line-clamp-1 font-medium mt-0.5`}>
                                                                    {lib.description || `📍 ${lib.location} • Area baca & fasilitas komputer`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {/* 3. Tombol 360 di Samping Kanan */}
                                                        <a
                                                            href={lib.link_360}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`px-3 py-2 rounded-xl text-[10px] sm:text-xs font-extrabold shadow flex items-center space-x-1 shrink-0 transition-all ${style.btn}`}
                                                        >
                                                            <span>Tour 360°</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            /* Sample Default Perpustakaan 360 Cards */
                                            <>
                                                <div className="p-4 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-md hover:-translate-y-0.5 transition-transform">
                                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                                            <Compass className="w-4 h-4 text-amber-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">Perpustakaan Utama Kampus 1</p>
                                                            <p className="text-[10px] sm:text-xs text-amber-400 line-clamp-1 font-medium mt-0.5">📍 Kampus 1 • Ruang baca ber-AC & spot diskusi</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href="https://kuula.co/share/collection/7l7Q1?logo=1&card=1&info=0&logosize=40&fs=1&vr=1&sd=1&initload=0&thumbs=1"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 rounded-xl text-[10px] sm:text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
                                                    >
                                                        <span>Tour 360°</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>

                                                <div className="p-4 rounded-2xl bg-amber-600 text-slate-950 flex items-center justify-between shadow-md hover:-translate-y-0.5 transition-transform">
                                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
                                                            <Compass className="w-4 h-4 text-slate-950" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-extrabold text-xs sm:text-sm text-slate-950 line-clamp-1">Ruang Baca Perpustakaan Kampus 2</p>
                                                            <p className="text-[10px] sm:text-xs text-amber-950 line-clamp-1 font-semibold mt-0.5">📍 Kampus 2 • Spot membaca tenang & e-library</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href="https://kuula.co/share/collection/7v2P3?logo=1&card=1&info=0&logosize=40&fs=1&vr=1&sd=1&initload=0&thumbs=1"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 rounded-xl text-[10px] sm:text-xs font-extrabold bg-slate-950 hover:bg-slate-800 text-amber-300 shadow flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
                                                    >
                                                        <span>Tour 360°</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Retained Stats Badge */}
                                    <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60">
                                            <p className="text-lg font-extrabold text-slate-950">{stats.total_books} Judul</p>
                                            <p className="text-[10px] text-amber-800 font-semibold uppercase">Katalog Buku</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/60">
                                            <p className="text-lg font-extrabold text-emerald-900">{stats.available_copies} Eksemplar</p>
                                            <p className="text-[10px] text-emerald-800 font-semibold uppercase">Tersedia di Rak</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. BROWSE BY CATEGORY (DDC Classification Grid) */}
            <section id="kategori" className="py-16 bg-white border-y border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                Jelajahi Berdasarkan Kategori DDC
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Klik kategori untuk melihat daftar koleksi buku (Login diperlukan untuk meminjam)
                            </p>
                        </div>

                        <Link
                            href="/katalog"
                            className="mt-3 sm:mt-0 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                        >
                            <span>Lihat Semua Kategori</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat, idx) => {
                            const style = categoryStyles[idx % categoryStyles.length];
                            const IconComponent = style.icon;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/katalog?category_id=${cat.id}`}
                                    className={`p-5 rounded-2xl bg-white border border-slate-200 ${style.border} hover:shadow-lg transition-all text-center flex flex-col items-center group`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-sm`}>
                                        <IconComponent className="w-7 h-7" />
                                    </div>
                                    <span className="font-extrabold text-xs text-slate-950 block line-clamp-1">{cat.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">[{cat.code}] • {cat.books_count} Buku</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. FEATURED BOOKS COLLECTION */}
            <section className="py-16 bg-[#FDFBF7]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                Koleksi Terpopuler & Terbaru
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Literatur akademik siap dipinjam di rak perpustakaan
                            </p>
                        </div>

                        <Link
                            href="/katalog"
                            className="mt-3 sm:mt-0 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                        >
                            <span>Buka Katalog Lengkap</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredBooks.map((book) => (
                            <div key={book.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-800 text-[10px] font-bold rounded-full">
                                            [{book.category?.code}] {book.category?.name}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">
                                            Rak: {book.rack?.code_rack}
                                        </span>
                                    </div>

                                    <h3 className="font-extrabold text-base text-slate-950 line-clamp-2 hover:text-amber-600 transition-colors">
                                        <Link href={`/katalog/${book.id}`}>{book.title}</Link>
                                    </h3>

                                    <p className="text-xs text-slate-500 font-medium">Penulis: {book.author}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold">Status Ketersediaan</span>
                                        <span className={`text-xs font-bold ${book.available_copies_count > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {book.available_copies_count > 0 ? `${book.available_copies_count} Eksemplar Tersedia` : 'Sedang Dipinjam'}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/katalog/${book.id}`}
                                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                                    >
                                        Detail Buku
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. WHY SIMPUS? (Harmonized Warm Amber Theme Section) */}
            <section id="fitur" className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 relative overflow-hidden backdrop-blur-sm">
                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />

                        <div className="text-center max-w-2xl mx-auto space-y-2">
                            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-900 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Keunggulan Platform</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                Mengapa Menggunakan Sistem Sirkulasi SIMPUS?
                            </h2>
                            <p className="text-slate-600 text-xs sm:text-sm">
                                Inovasi sirkulasi mandiri berbasis teknologi modern untuk menjamin kenyamanan dan kecepatan transaksi peminjaman Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                            <div className="bg-white/90 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Self-Service Kamera HP</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Cukup pindai stiker barcode di sampul buku langsung dari kamera ponsel Anda tanpa perlu antre di meja pustakawan.
                                </p>
                            </div>

                            <div className="bg-white/90 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Pessimistic Stock Lock</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Sistem proteksi tingkat tinggi yang mencegah penahanan stok ilusi & perebutan eksemplar ganda secara real-time.
                                </p>
                            </div>

                            <div className="bg-white/90 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Tiket Digital 5 Menit</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Tiket dinamis berjangka waktu singkat dengan timer hitung mundur untuk pengesahan instan di meja petugas.
                                </p>
                            </div>

                            <div className="bg-white/90 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group">
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Kios Presensi Pintu</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Terminal presensi terautentikasi otomatis di pintu masuk perpustakaan untuk pencatatan riwayat kunjungan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. SEARCH BANNER (Equalized Width: max-w-7xl) */}
            <section className="py-12 bg-white border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center sm:text-left">
                            <h3 className="text-xl font-extrabold text-slate-950">Temukan Buku Favorit Anda Sekarang</h3>
                            <p className="text-xs text-slate-600">Cari berdasarkan judul buku, pengarang, ISBN, atau nomor lokasi rak.</p>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex items-center space-x-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Masukkan Judul Buku / Penulis..."
                                className="px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 w-full sm:w-80 shadow-sm"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                            >
                                Cari Buku
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* 7. FOOTER */}
            <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-5 space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
                                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <span className="font-extrabold text-xl text-white tracking-tight">SIMPUS</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Sistem Informasi Perpustakaan Digital UPT Perpustakaan Politeknik Indonusa Surakarta. Mendukung sirkulasi mandiri berbasis scan barcode HP & locking transaksional.
                            </p>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigasi Utama</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/" className="hover:text-amber-400">Beranda</Link></li>
                                <li><Link href="/katalog" className="hover:text-amber-400">Katalog Buku</Link></li>
                                <li><Link href="/presensi" target="_blank" className="hover:text-amber-400">Kios Presensi Pintu</Link></li>
                                <li><Link href="/login" className="hover:text-amber-400">Portal Login</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Lokasi UPT Perpustakaan</h4>
                            <p className="text-xs leading-relaxed">
                                Kampus Politeknik Indonusa Surakarta<br />
                                Jl. KH. Samanhudi No.84, Sondakan, Laweyan, Kota Surakarta, Jawa Tengah 57147
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
                        <p>© {new Date().getFullYear()} UPT Perpustakaan Politeknik Indonusa Surakarta. All rights reserved.</p>
                        <p>SIMPUS Digital Circulation System v2.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
