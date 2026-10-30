import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    ArrowLeft, 
    Search, 
    FileText, 
    QrCode, 
    GraduationCap, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Compass, 
    Download, 
    BookmarkCheck, 
    ExternalLink, 
    ShieldCheck,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function GuideIndex({ guides = [] }) {
    const { auth } = usePage().props;
    const isMemberLoggedIn = auth && auth.user && auth.user.role === 'anggota';

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [expandedGuideId, setExpandedGuideId] = useState(guides[0]?.id || null);

    const categories = ['Semua', ...new Set(guides.map((g) => g.category))];

    const filteredGuides = guides.filter((g) => {
        const matchesCategory = selectedCategory === 'Semua' || g.category === selectedCategory;
        const matchesSearch = 
            g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.summary.toLowerCase().includes(search.toLowerCase()) ||
            g.steps.some(s => s.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const content = (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-3 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Pusat Bantuan & Manual Book</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                        Panduan Layanan Perpustakaan
                    </h1>
                    <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
                        Pelajari alur sirkulasi mandiri berbasis scan HP, prosedur perpanjangan pinjaman, penyerahan naskah Tugas Akhir/Skripsi, hingga akses jurnal internasional.
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kata kunci panduan (misal: peminjaman, TA, denda, scan, GALE)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-900"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                selectedCategory === cat
                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Panduan (Accordion / Card View) */}
            <div className="space-y-4">
                {filteredGuides.length > 0 ? (
                    filteredGuides.map((guide, idx) => {
                        const isExpanded = expandedGuideId === guide.id;
                        return (
                            <div 
                                key={guide.id}
                                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                                                {guide.category}
                                            </span>
                                            <h3 className="font-extrabold text-slate-950 text-base sm:text-lg">
                                                {guide.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                {guide.summary}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-2 text-slate-400 shrink-0">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
                                        <div className="space-y-2.5">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                                Langkah-Langkah & Prosedur:
                                            </h4>
                                            <div className="space-y-2">
                                                {guide.steps.map((step, sIdx) => (
                                                    <div key={sIdx} className="flex items-start space-x-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                                                        <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">
                                                            {sIdx + 1}
                                                        </span>
                                                        <span className="font-medium">{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {guide.notes && (
                                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
                                                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                                <div className="space-y-0.5">
                                                    <span className="font-bold block">Catatan Penting:</span>
                                                    <p className="text-slate-700">{guide.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 space-y-3">
                        <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-900">Panduan tidak ditemukan</h4>
                        <p className="text-xs text-slate-500">Coba gunakan kata kunci pencarian yang berbeda.</p>
                    </div>
                )}
            </div>

            {/* Quick Link Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <Link
                    href="/anggota/scan"
                    className="p-5 bg-white hover:bg-amber-50/50 rounded-3xl border border-slate-200/80 shadow-sm transition-all group space-y-2"
                >
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-950 group-hover:text-amber-800">Scan Barcode Rak</h4>
                    <p className="text-[11px] text-slate-500">Mulai peminjaman buku fisik langsung di depan rak.</p>
                </Link>

                <Link
                    href="/anggota/borrowings"
                    className="p-5 bg-white hover:bg-emerald-50/50 rounded-3xl border border-slate-200/80 shadow-sm transition-all group space-y-2"
                >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                        <BookmarkCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-950 group-hover:text-emerald-800">Buku Dipinjam Saya</h4>
                    <p className="text-[11px] text-slate-500">Cek jadwal jatuh tempo dan ajukan perpanjangan pinjaman.</p>
                </Link>

                <Link
                    href="/presensi"
                    target="_blank"
                    className="p-5 bg-white hover:bg-indigo-50/50 rounded-3xl border border-slate-200/80 shadow-sm transition-all group space-y-2"
                >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-950 group-hover:text-indigo-800">Presensi Kunjungan</h4>
                    <p className="text-[11px] text-slate-500">Buka antarmuka presensi terminal Kiosk pintu masuk.</p>
                </Link>
            </div>
        </div>
    );

    // Jika user sudah login sebagai anggota, render menggunakan AnggotaLayout
    if (isMemberLoggedIn) {
        return (
            <AnggotaLayout activeMenu="panduan">
                <Head title="Panduan Layanan Perpustakaan - Anggota" />
                {content}
            </AnggotaLayout>
        );
    }

    // Jika diakses publik / pengunjung umum
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950">
            <Head title="Panduan Layanan - Website Perpustakaan" />

            {/* Top Bar Navigation */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-all">
                            <BookOpen className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                                Website Perpustakaan<span className="text-amber-600">.</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                                Politeknik Indonusa Surakarta
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/"
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-all flex items-center space-x-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                        <Link
                            href="/login"
                            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-md transition-all"
                        >
                            Portal Login
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {content}
            </main>
        </div>
    );
}
