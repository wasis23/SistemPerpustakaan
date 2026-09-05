import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Layers,
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
    X,
    Sparkles,
    FileText
} from 'lucide-react';

export default function Prosiding({ journals, filters, prodiList, availableYears, stats }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.prodi || '');
    const [publishYear, setPublishYear] = useState(filters.publish_year || '');
    const [perPage, setPerPage] = useState(filters.per_page || '12');

    const [selectedJournal, setSelectedJournal] = useState(null);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/prosiding', {
            search,
            prodi,
            publish_year: publishYear,
            per_page: perPage,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setProdi('');
        setPublishYear('');
        setPerPage('12');
        router.get('/prosiding', {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Direktori Prosiding Seminar - Politeknik Indonusa Surakarta" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-emerald-900/10">
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
                                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Prosiding Seminar Nasional</span>
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded-full">
                                    {stats?.total || 0} Prosiding
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Kumpulan makalah ilmiah dan prosiding seminar konferensi civitas akademika</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/katalog"
                            className="hidden sm:inline-flex px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-bold rounded-full transition-all"
                        >
                            Katalog Buku
                        </Link>
                        <Link
                            href="/karya-dosen"
                            className="hidden sm:inline-flex px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-bold rounded-full transition-all"
                        >
                            Karya Buku Dosen
                        </Link>

                        {auth && auth.user ? (
                            <Link
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'}
                                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-full shadow transition-all"
                            >
                                Dashboard Saya
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow transition-all flex items-center space-x-1.5"
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
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Total Prosiding</p>
                            <p className="text-lg font-black text-slate-900">{stats?.total || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Terdaftar ISSN</p>
                            <p className="text-lg font-black text-slate-900">{stats?.with_issn || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                            <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Akses Full Text</p>
                            <p className="text-lg font-black text-slate-900">{stats?.with_url || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Program Studi</p>
                            <p className="text-lg font-black text-slate-900">{stats?.total_prodi || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                            <Search className="w-4 h-4 text-emerald-600" />
                            <span>Pencarian Prosiding Seminar</span>
                        </h2>
                    </div>

                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ketik judul prosiding, penyelenggara/penerbit, prodi, atau ISSN..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={prodi}
                                onChange={(e) => setProdi(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-emerald-500 text-xs font-medium cursor-pointer"
                            >
                                <option value="">Semua Program Studi</option>
                                {prodiList.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-1">
                            <select
                                value={publishYear}
                                onChange={(e) => setPublishYear(e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-emerald-500 text-xs font-medium cursor-pointer"
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
                                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow flex items-center justify-center space-x-1 cursor-pointer transition-all"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold cursor-pointer transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Journals Grid */}
                {journals.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journals.data.map((journal) => (
                            <div
                                key={journal.id}
                                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-3.5">
                                    {/* Badges */}
                                    <div className="flex items-center justify-between gap-1.5">
                                        <span className="px-2.5 py-1 bg-emerald-100/90 text-emerald-900 border border-emerald-200 font-extrabold rounded-full text-[10px]">
                                            Prosiding Seminar
                                        </span>
                                        {journal.publish_year && (
                                            <span className="px-2.5 py-0.5 font-mono font-bold rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                <span>{journal.publish_year}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Cover image or Stylized banner */}
                                    <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 overflow-hidden relative shadow-sm group-hover:scale-[1.02] transition-transform flex flex-col justify-between p-4 text-white">
                                        {journal.cover_image ? (
                                            <img
                                                src={journal.cover_image}
                                                alt={journal.title}
                                                className="w-full h-full object-cover rounded-xl"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between text-emerald-300">
                                                    <Layers className="w-5 h-5 text-emerald-400" />
                                                    <span className="text-[10px] font-mono font-bold">{journal.publish_year || 'SEMINAR'}</span>
                                                </div>
                                                <p className="text-xs font-black text-white line-clamp-2 leading-snug uppercase">
                                                    {journal.title}
                                                </p>
                                                <p className="text-[10px] font-medium text-slate-300 line-clamp-1">
                                                    {journal.prodi || 'Seminar Nasional Politeknik Indonusa'}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Journal Meta */}
                                    <div className="space-y-1.5">
                                        <h3
                                            onClick={() => setSelectedJournal(journal)}
                                            className="font-extrabold text-base text-slate-950 hover:text-emerald-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                                        >
                                            {journal.title}
                                        </h3>

                                        {journal.publisher && (
                                            <p className="text-xs text-slate-600 font-medium line-clamp-1 flex items-center space-x-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>Penyelenggara: {journal.publisher}</span>
                                            </p>
                                        )}

                                        {journal.prodi && (
                                            <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center space-x-1.5">
                                                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>Prodi: {journal.prodi}</span>
                                            </p>
                                        )}

                                        <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono text-slate-500">
                                            {journal.issn && (
                                                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                                                    p-ISSN/ISBN: {journal.issn}
                                                </span>
                                            )}
                                            {journal.e_issn && (
                                                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                                                    e-ISSN: {journal.e_issn}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedJournal(journal)}
                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                                    >
                                        Detail
                                    </button>

                                    {journal.access_url ? (
                                        <a
                                            href={journal.access_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-1.5 bg-slate-950 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
                                        >
                                            <span>Buka Prosiding</span>
                                            <ExternalLink className="w-3 h-3 text-amber-400" />
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
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                            <Layers className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-950">Tidak ada prosiding seminar ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Coba ubah kata kunci pencarian atau reset filter untuk melihat seluruh katalog prosiding seminar.
                        </p>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-5 py-2.5 bg-slate-950 text-white font-bold text-xs rounded-full hover:bg-emerald-600 transition-all cursor-pointer"
                        >
                            Reset Semua Filter
                        </button>
                    </div>
                )}

                {/* Pagination Controls */}
                {journals.links && journals.links.length > 3 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
                        <p className="text-xs text-slate-500">
                            Menampilkan <span className="font-bold text-slate-900">{journals.from || 0}</span> - <span className="font-bold text-slate-900">{journals.to || 0}</span> dari <span className="font-bold text-slate-900">{journals.total}</span> prosiding
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
                                                ? 'bg-emerald-600 text-white font-black shadow-sm'
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

            {/* Modal Detail Prosiding */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold rounded-full text-[10px]">
                                    Prosiding Seminar
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
                                <span className="text-slate-400 block font-semibold">Penyelenggara:</span>
                                <span className="font-bold text-slate-900">{selectedJournal.publisher || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">Program Studi:</span>
                                <span className="font-bold text-slate-900">{selectedJournal.prodi || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">Tahun Terbit:</span>
                                <span className="font-bold text-slate-900">{selectedJournal.publish_year || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">p-ISSN / ISBN:</span>
                                <span className="font-mono text-slate-900">{selectedJournal.issn || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-semibold">e-ISSN:</span>
                                <span className="font-mono text-slate-900">{selectedJournal.e_issn || '-'}</span>
                            </div>
                        </div>

                        {selectedJournal.description && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Deskripsi Makalah:</h4>
                                <p className="text-xs text-slate-600 leading-relaxed bg-[#FDFBF7] p-4 rounded-2xl border border-emerald-900/10">
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
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-2"
                                >
                                    <span>Kunjungi Prosiding</span>
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
                    <p>© {new Date().getFullYear()} UPT Perpustakaan Politeknik Indonusa Surakarta. Pangkalan Data Prosiding Seminar Nasional.</p>
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
