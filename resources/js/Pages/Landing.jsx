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
    Lock,
    ShieldCheck,
    Layers,
    BookMarked,
    Library,
    Compass,
    ExternalLink,
    GraduationCap,
    Award,
    Building2,
    Calendar,
    Hash,
    Download,
    X,
    Star,
    User,
    Database,
    Smartphone,
    Globe,
    FileText
} from 'lucide-react';

export default function Landing({ featuredBooks = [], categories = [], libraries = [], stats = {}, latestPosts = [] }) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/katalog?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans">
            <Head title="SIMPUS - Perpustakaan Digital Politeknik Indonusa Surakarta" />

            {/* 1. TOP NAVIGATION BAR (Warm) */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo & Title */}
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

                    {/* Right CTA Actions: Portal Anggota */}
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

            {/* 2. HERO SECTION (1. Warm #FDFBF7) */}
            <section className="relative pt-12 pb-16 overflow-hidden bg-[#FDFBF7]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Hero Text Column */}
                        <div className="lg:col-span-6 space-y-6">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                                Pinjam Cepat.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">
                                    Belajar Lebih Banyak.
                                </span>
                            </h1>

                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                                Layanan perpustakaan digital Politeknik Indonusa Surakarta. Pindai barcode buku di depan rak menggunakan kamera HP, dapatkan tiket digital 5 menit, serta jelajahi repositori karya buku dosen.
                            </p>
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
                                                        card: 'bg-[#FDFBF7] text-slate-900 border border-slate-200/80',
                                                        subtext: 'text-amber-700 font-bold',
                                                        title: 'text-slate-950',
                                                        btn: 'bg-slate-950 hover:bg-slate-800 text-amber-400',
                                                    },
                                                    {
                                                        card: 'bg-amber-600 text-white',
                                                        subtext: 'text-amber-100',
                                                        title: 'text-white',
                                                        btn: 'bg-white hover:bg-slate-100 text-amber-950',
                                                    },
                                                ];
                                                const style = styles[idx % styles.length];

                                                return (
                                                    <div
                                                        key={lib.id}
                                                        className={`${style.card} p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group`}
                                                    >
                                                        <div className="space-y-0.5 max-w-[65%]">
                                                            <span className={`text-[10px] font-mono block ${style.subtext}`}>
                                                                {lib.location}
                                                            </span>
                                                            <h4 className={`font-extrabold text-xs leading-snug line-clamp-1 ${style.title}`}>
                                                                {lib.name}
                                                            </h4>
                                                        </div>

                                                        {(lib.link_360 || lib.virtual_tour_url) ? (
                                                            <a
                                                                href={lib.link_360 || lib.virtual_tour_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all shadow-sm shrink-0 ${style.btn}`}
                                                            >
                                                                <span>Tour 360°</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 italic">Segera Hadir</span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-slate-400 italic text-center py-4">
                                                Belum ada tautan virtual tour.
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats Badge */}
                                    <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
                                        <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200/60">
                                            <p className="text-base font-extrabold text-slate-950">{stats.total_books || 0}</p>
                                            <p className="text-[9px] text-amber-800 font-semibold uppercase">Judul Buku</p>
                                        </div>
                                        <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/60">
                                            <p className="text-base font-extrabold text-emerald-900">{stats.available_copies || 0}</p>
                                            <p className="text-[9px] text-emerald-800 font-semibold uppercase">Tersedia di Rak</p>
                                        </div>
                                        <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-200/60">
                                            <p className="text-base font-extrabold text-purple-900">{stats.total_lecturer_books || 0}</p>
                                            <p className="text-[9px] text-purple-800 font-semibold uppercase">Buku Dosen</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PORTAL & DIREKTORI AKADEMIK TERPADU (Repository, Digital Library, Indonusa Publisher, Jurnal Nasional, Jurnal Internasional, Prosiding) */}
            <section className="py-16 bg-white border-t border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            Portal Akses Referensi & Publikasi Terpadu
                        </h2>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Akses langsung repositori institusi, e-library mobile, karya buku dosen, direktori jurnal terakreditasi SINTA, jurnal internasional, dan prosiding seminar Politeknik Indonusa Surakarta.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Repository */}
                        <div className="bg-[#FDFBF7] hover:bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200">
                                        E-Prints Institusi
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-emerald-700 transition-colors">
                                        Repository
                                    </h3>
                                    <p className="text-xs font-semibold text-emerald-800">
                                        E-Prints Skripsi & Tugas Akhir
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Pangkalan data karya ilmiah, skripsi, laporan tugas akhir, dan publikasi penelitian civitas akademika Politeknik Indonusa Surakarta.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/70">
                                <a
                                    href="https://eprint.poltekindonusa.ac.id/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow"
                                >
                                    <span>Buka Repository E-Prints</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* 2. Digital Library */}
                        <div className="bg-[#FDFBF7] hover:bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-blue-100/80 text-blue-800 text-[10px] font-extrabold rounded-full border border-blue-200">
                                        Kubuku E-Library
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-blue-700 transition-colors">
                                        Digital Library
                                    </h3>
                                    <p className="text-xs font-semibold text-blue-800">
                                        Aplikasi Baca E-Book Digital
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Layanan perpustakaan digital interaktif Kubuku untuk membaca ribuan koleksi e-book akademik langsung di Android dan komputer/laptop.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/70">
                                <a
                                    href="https://kubuku.id/download/digilib-politeknik-indonusa-surakarta/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow"
                                >
                                    <span>Akses Digital Library Kubuku</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* 3. Indonusa Publisher */}
                        <div className="bg-[#FDFBF7] hover:bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-amber-100/80 text-amber-900 text-[10px] font-extrabold rounded-full border border-amber-200">
                                        Karya Buku Dosen
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-amber-700 transition-colors">
                                        Indonusa Publisher
                                    </h3>
                                    <p className="text-xs font-semibold text-amber-800">
                                        Buku Ajar & Monograf Dosen
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Penerbitan dan etalase karya buku ajar, buku referensi, monograf, dan modul praktikum yang ditulis oleh dosen Politeknik Indonusa.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/70">
                                <Link
                                    href="/karya-dosen"
                                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow"
                                >
                                    <span>Jelajahi Karya Buku Dosen</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                </Link>
                            </div>
                        </div>

                        {/* 4. Jurnal Nasional */}
                        <div className="bg-[#FDFBF7] hover:bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full border border-blue-200">
                                        {stats.total_national_journals ? `${stats.total_national_journals} Jurnal Terdata` : 'Terakreditasi SINTA'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-blue-700 transition-colors">
                                        Jurnal Nasional
                                    </h3>
                                    <p className="text-xs font-semibold text-blue-800">
                                        Pangkalan Jurnal Terakreditasi SINTA
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Direktori portal jurnal ilmiah nasional terakreditasi SINTA dan ber-ISSN lintas program studi Politeknik Indonusa Surakarta.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/70">
                                <Link
                                    href="/jurnal-nasional"
                                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow"
                                >
                                    <span>Buka Jurnal Nasional</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* 5. Jurnal Internasional */}
                        <div className="bg-[#FDFBF7] hover:bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-purple-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-full border border-purple-200">
                                        {stats.total_international_journals ? `${stats.total_international_journals} Jurnal Terdata` : 'Indeks Global'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-purple-700 transition-colors">
                                        Jurnal Internasional
                                    </h3>
                                    <p className="text-xs font-semibold text-purple-800">
                                        Publikasi Bereputasi Internasional
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Koleksi dan direktori jurnal internasional bereputasi, terindeks dalam database ilmiah global, serta rujukan riset mutakhir.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/70">
                                <Link
                                    href="/jurnal-internasional"
                                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow"
                                >
                                    <span>Buka Jurnal Internasional</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* 6. Prosiding */}
                        <div className="bg-[#FDFBF7] hover:bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200">
                                        {stats.total_proceedings ? `${stats.total_proceedings} Prosiding` : 'Seminar & Konferensi'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-emerald-700 transition-colors">
                                        Prosiding
                                    </h3>
                                    <p className="text-xs font-semibold text-emerald-800">
                                        Makalah Seminar & Konferensi
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Kumpulan artikel dan prosiding seminar nasional hasil diseminasi karya riset dan pengabdian masyarakat civitas akademika.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/70">
                                <Link
                                    href="/prosiding"
                                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow"
                                >
                                    <span>Buka Prosiding Seminar</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FEATURED BOOKS COLLECTION (Warm #FDFBF7) */}
            <section className="py-16 bg-[#FDFBF7] border-t border-amber-900/10">
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

                                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
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

            {/* 5. BERITA & KABAR LITERASI TERBARU (4. Putih) */}
            {latestPosts && latestPosts.length > 0 && (
                <section className="py-16 bg-white border-t border-slate-200/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                            <div className="space-y-1.5">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                                    Berita & Kabar Perpustakaan
                                </h2>
                                <p className="text-slate-600 text-xs sm:text-sm">
                                    Pengumuman resmi, kegiatan literasi akademik, dan pembaruan fasilitas perpustakaan.
                                </p>
                            </div>

                            <Link
                                href="/berita"
                                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1.5 bg-[#FDFBF7] hover:bg-amber-50 px-4 py-2 rounded-full transition-all border border-slate-200 shadow-sm"
                            >
                                <span>Lihat Semua Berita</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {latestPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/berita/${post.slug}`}
                                    className="group bg-[#FDFBF7] rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
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
                                            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{post.reading_time || 2} menit baca</span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <h3 className="font-black text-base text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>

                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {post.excerpt || post.meta_description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                                        <span>Baca Berita</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. WHY SIMPUS? (5. Warm #FDFBF7) */}
            <section id="fitur" className="py-16 bg-[#FDFBF7] border-t border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 relative overflow-hidden backdrop-blur-sm">
                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />

                        <div className="text-center max-w-2xl mx-auto space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                Mengapa Menggunakan Sistem Sirkulasi SIMPUS?
                            </h2>
                            <p className="text-slate-600 text-xs sm:text-sm">
                                Inovasi sirkulasi mandiri berbasis teknologi modern untuk menjamin kenyamanan dan kecepatan transaksi peminjaman Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                            <div className="bg-white/95 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Self-Service Kamera HP</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Cukup pindai stiker barcode di sampul buku langsung dari kamera ponsel Anda tanpa perlu antre di meja pustakawan.
                                </p>
                            </div>

                            <div className="bg-white/95 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Pessimistic Stock Lock</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Sistem proteksi tingkat tinggi yang mencegah penahanan stok ilusi & perebutan eksemplar ganda secara real-time.
                                </p>
                            </div>

                            <div className="bg-white/95 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Tiket Digital 5 Menit</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Tiket dinamis berjangka waktu singkat dengan timer hitung mundur untuk pengesahan instan di meja petugas.
                                </p>
                            </div>

                            <div className="bg-white/95 p-6 rounded-2xl border border-amber-900/10 hover:border-amber-500 hover:shadow-xl transition-all space-y-3 group shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-950">Presensi Pintu Masuk</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Presensi mandiri terautentikasi otomatis di pintu masuk perpustakaan untuk pencatatan riwayat kunjungan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. SEARCH BANNER (6. Putih) */}
            <section className="py-12 bg-white border-t border-slate-200/80">
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
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
                            >
                                Cari Buku
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* 9. FOOTER */}
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
                                Sistem Informasi Perpustakaan Digital UPT Perpustakaan Politeknik Indonusa Surakarta. Mendukung sirkulasi mandiri berbasis scan barcode HP, locking transaksional, dan repositori karya buku dosen.
                            </p>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigasi Utama</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/" className="hover:text-amber-400">Beranda</Link></li>
                                <li><Link href="/katalog" className="hover:text-amber-400">Katalog Buku</Link></li>
                                <li><Link href="/karya-dosen" className="hover:text-amber-400">Karya Buku Dosen</Link></li>
                                <li><Link href="/jurnal" className="hover:text-amber-400">Publikasi & Jurnal</Link></li>
                                <li><Link href="/berita" className="hover:text-amber-400">Berita & Informasi</Link></li>
                                <li><Link href="/presensi" target="_blank" className="hover:text-amber-400">Presensi Kunjungan</Link></li>
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
