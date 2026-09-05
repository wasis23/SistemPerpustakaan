import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    FileText,
    Search,
    Filter,
    ArrowLeft,
    LogIn,
    BookOpen,
    Building2,
    Calendar,
    ExternalLink,
    Award,
    Hash,
    ChevronLeft,
    ChevronRight,
    Globe,
    Layers,
    CheckCircle2,
    X,
    Info,
    Sparkles
} from 'lucide-react';

export default function Index({ journals, filters, prodiList, sintaList, availableYears, stats }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [prodi, setProdi] = useState(filters.prodi || '');
    const [sinta, setSinta] = useState(filters.sinta || '');
    const [publishYear, setPublishYear] = useState(filters.publish_year || '');
    const [perPage, setPerPage] = useState(filters.per_page || '12');

    const [selectedJournal, setSelectedJournal] = useState(null);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/jurnal', {
            search,
            type,
            prodi,
            sinta,
            publish_year: publishYear,
            per_page: perPage,
        }, { preserveState: true });
    };

    const handleTabChange = (selectedType) => {
        setType(selectedType);
        router.get('/jurnal', {
            search,
            type: selectedType,
            prodi,
            sinta,
            publish_year: publishYear,
            per_page: perPage,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        setProdi('');
        setSinta('');
        setPublishYear('');
        setPerPage('12');
        router.get('/jurnal', {}, { preserveState: true });
    };

    const getTypeBadgeClass = (journalType) => {
        switch (journalType) {
            case 'Nasional':
                return 'bg-blue-100/90 text-blue-900 border-blue-200';
            case 'Internasional':
                return 'bg-purple-100/90 text-purple-900 border-purple-200';
            case 'Prosiding':
                return 'bg-emerald-100/90 text-emerald-900 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
            <Head title="Direktori Jurnal & Prosiding Ilmiah - Politeknik Indonusa Surakarta" />

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
                                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Direktori Publikasi Ilmiah</span>
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-full">
                                    {stats?.total || 0} Publikasi
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Pangkalan data Jurnal Nasional SINTA, Jurnal Internasional & Prosiding Seminar</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/katalog"
                            className="text-xs font-bold text-slate-700 hover:text-amber-700 hidden sm:inline-block px-3 py-2"
                        >
                            Katalog Buku
                        </Link>
                        <Link
                            href="/karya-dosen"
                            className="text-xs font-bold text-slate-700 hover:text-amber-700 hidden sm:inline-block px-3 py-2"
                        >
                            Karya Buku Dosen
                        </Link>
                        {auth?.user ? (
                            <Link
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'}
                                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-full transition-all flex items-center space-x-1.5"
                            >
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full transition-all flex items-center space-x-1.5 shadow-sm"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Masuk</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
                {/* Hero Header & Quick Stats */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-3">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Publikasi Riset & Karya Ilmiah Terpadu</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                                Direktori Jurnal & Prosiding Ilmiah
                            </h1>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                                Akses terbuka ke direktori publikasi jurnal nasional terakreditasi SINTA, jurnal bereputasi internasional, serta prosiding seminar nasional Politeknik Indonusa Surakarta.
                            </p>
                        </div>

                        {/* Quick Metrics Badges */}
                        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                            <div
                                onClick={() => handleTabChange('Nasional')}
                                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${type === 'Nasional' ? 'bg-blue-600/30 border-blue-400 shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <p className="text-2xl font-black text-blue-400">{stats?.nasional || 0}</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Jurnal Nasional</p>
                            </div>
                            <div
                                onClick={() => handleTabChange('Internasional')}
                                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${type === 'Internasional' ? 'bg-purple-600/30 border-purple-400 shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <p className="text-2xl font-black text-purple-400">{stats?.internasional || 0}</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Jurnal Internasional</p>
                            </div>
                            <div
                                onClick={() => handleTabChange('Prosiding')}
                                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${type === 'Prosiding' ? 'bg-emerald-600/30 border-emerald-400 shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <p className="text-2xl font-black text-emerald-400">{stats?.prosiding || 0}</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Prosiding Seminar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Type Navigation Tabs */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3 overflow-x-auto scrollbar-none">
                        {[
                            { key: '', label: 'Semua Publikasi', count: stats?.total || 0 },
                            { key: 'Nasional', label: 'Jurnal Nasional (SINTA)', count: stats?.nasional || 0 },
                            { key: 'Internasional', label: 'Jurnal Internasional', count: stats?.internasional || 0 },
                            { key: 'Prosiding', label: 'Prosiding Seminar', count: stats?.prosiding || 0 },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
                                    type === tab.key
                                        ? 'bg-slate-950 text-amber-400 shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${type === tab.key ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter Bar */}
                    <form onSubmit={handleFilter} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Search Keyword */}
                            <div className="md:col-span-5 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari judul jurnal, prosiding, penerbit, ISSN..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Prodi Filter */}
                            <div className="md:col-span-3">
                                <select
                                    value={prodi}
                                    onChange={(e) => setProdi(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="">Semua Program Studi</option>
                                    {prodiList.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SINTA / Indeksasi Filter */}
                            <div className="md:col-span-2">
                                <select
                                    value={sinta}
                                    onChange={(e) => setSinta(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="">Semua Akreditasi / Indeks</option>
                                    {sintaList.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions Button */}
                            <div className="md:col-span-2 flex items-center space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Terapkan</span>
                                </button>

                                {(search || prodi || sinta || publishYear || type) && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                                        title="Reset Filter"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Publications Grid */}
                {journals.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journals.data.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-3.5">
                                    {/* Badges */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className={`px-2.5 py-1 font-extrabold rounded-full text-[10px] border ${getTypeBadgeClass(item.journal_type)}`}>
                                            {item.journal_type === 'Prosiding' ? 'Prosiding Seminar' : `Jurnal ${item.journal_type}`}
                                        </span>
                                        {item.sinta && (
                                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                {item.sinta}
                                            </span>
                                        )}
                                    </div>

                                    {/* Cover Image or Graphic Banner */}
                                    {item.cover_image ? (
                                        <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                                            <img
                                                src={item.cover_image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-4 flex flex-col justify-between text-white group-hover:from-slate-950 group-hover:to-amber-900 transition-all">
                                            <div className="flex items-center justify-between">
                                                <FileText className="w-5 h-5 text-amber-400" />
                                                <span className="text-[10px] font-mono text-slate-300">{item.prodi || 'Politeknik Indonusa'}</span>
                                            </div>
                                            <p className="text-xs font-black text-amber-300 uppercase line-clamp-2">
                                                {item.title}
                                            </p>
                                        </div>
                                    )}

                                    {/* Journal Meta */}
                                    <div className="space-y-1.5">
                                        <h3
                                            onClick={() => setSelectedJournal(item)}
                                            className="font-extrabold text-base text-slate-950 hover:text-amber-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                                        >
                                            {item.title}
                                        </h3>

                                        {item.publisher && (
                                            <p className="text-xs text-slate-600 font-medium line-clamp-1 flex items-center space-x-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>Penerbit: {item.publisher}</span>
                                            </p>
                                        )}

                                        {item.prodi && (
                                            <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center space-x-1.5">
                                                <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span>Prodi: {item.prodi}</span>
                                            </p>
                                        )}

                                        {/* ISSN & e-ISSN */}
                                        <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono text-slate-500">
                                            {item.issn && (
                                                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                                                    p-ISSN: {item.issn}
                                                </span>
                                            )}
                                            {item.e_issn && (
                                                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                                                    e-ISSN: {item.e_issn}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedJournal(item)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                                    >
                                        Detail
                                    </button>

                                    {item.access_url ? (
                                        <a
                                            href={item.access_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-1 shrink-0"
                                        >
                                            <span>Buka Publikasi</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">URL Belum Ada</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                            <FileText className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-950">Tidak ada data publikasi ilmiah ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan seluruh data jurnal dan prosiding.
                        </p>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-5 py-2.5 bg-slate-950 text-amber-400 font-bold text-xs rounded-full hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                        >
                            <span>Reset Semua Filter</span>
                        </button>
                    </div>
                )}

                {/* Pagination Controls */}
                {journals.links && journals.links.length > 3 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
                        <p className="text-xs text-slate-500">
                            Menampilkan <span className="font-bold text-slate-900">{journals.from || 0}</span> - <span className="font-bold text-slate-900">{journals.to || 0}</span> dari <span className="font-bold text-slate-900">{journals.total}</span> publikasi
                        </p>

                        <div className="flex items-center space-x-1.5">
                            {journals.links.map((link, idx) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`p-2 rounded-xl text-xs font-bold transition-all ${
                                                link.url
                                                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Link>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`p-2 rounded-xl text-xs font-bold transition-all ${
                                                link.url
                                                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                                : link.url
                                                ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                                : 'text-slate-300'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Detail Publikasi Ilmiah */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className={`px-2.5 py-0.5 font-extrabold rounded-full text-[10px] border ${getTypeBadgeClass(selectedJournal.journal_type)}`}>
                                    {selectedJournal.journal_type === 'Prosiding' ? 'Prosiding Seminar' : `Jurnal ${selectedJournal.journal_type}`}
                                </span>
                                <h2 className="text-xl font-black text-slate-950">{selectedJournal.title}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedJournal(null)}
                                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedJournal.cover_image && (
                            <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border">
                                <img
                                    src={selectedJournal.cover_image}
                                    alt={selectedJournal.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                            <div>
                                <span className="text-slate-400 block font-semibold">Penerbit:</span>
                                <span className="font-bold text-slate-900">{selectedJournal.publisher || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">Program Studi:</span>
                                <span className="font-bold text-slate-900">{selectedJournal.prodi || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">Akreditasi / SINTA / Indeks:</span>
                                <span className="font-bold text-amber-700">{selectedJournal.sinta || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">Tahun Terbit:</span>
                                <span className="font-bold text-slate-900">{selectedJournal.publish_year || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">p-ISSN:</span>
                                <span className="font-mono text-slate-900">{selectedJournal.issn || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">e-ISSN:</span>
                                <span className="font-mono text-slate-900">{selectedJournal.e_issn || '-'}</span>
                            </div>
                        </div>

                        {selectedJournal.description && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Deskripsi & Cakupan:</h4>
                                <p className="text-xs text-slate-600 leading-relaxed bg-[#FDFBF7] p-4 rounded-2xl border border-amber-900/10">
                                    {selectedJournal.description}
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setSelectedJournal(null)}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                            >
                                Tutup
                            </button>
                            {selectedJournal.access_url && (
                                <a
                                    href={selectedJournal.access_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                                >
                                    <span>Kunjungi Portal Publikasi</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-3 sm:space-y-0">
                    <p>© {new Date().getFullYear()} UPT Perpustakaan Politeknik Indonusa Surakarta. Pangkalan Data Publikasi Ilmiah & Jurnal.</p>
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="hover:text-amber-400">Beranda</Link>
                        <Link href="/katalog" className="hover:text-amber-400">Katalog</Link>
                        <Link href="/karya-dosen" className="hover:text-amber-400">Karya Dosen</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
