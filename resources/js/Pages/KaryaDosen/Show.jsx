import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    GraduationCap,
    BookOpen,
    Building2,
    Calendar,
    Hash,
    ExternalLink,
    Download,
    Star,
    Layers,
    User,
    Sparkles,
    Share2,
    LogIn
} from 'lucide-react';

export default function Show({ book, relatedBooks = [] }) {
    const { auth } = usePage().props;

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
            <Head title={`${book.title} - Karya Buku Dosen Politeknik Indonusa Surakarta`} />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/karya-dosen"
                            className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                            title="Kembali ke Daftar Karya"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Katalog Karya Dosen Publik</span>
                            </div>
                            <h1 className="text-sm sm:text-base font-black text-slate-950 tracking-tight line-clamp-1 max-w-md sm:max-w-xl">
                                {book.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/karya-dosen"
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-amber-700 text-xs font-bold rounded-full transition-all"
                        >
                            Semua Karya Dosen
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
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Cover & Quick Actions (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
                            <div className="w-48 h-64 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-600/30 overflow-hidden shadow-lg flex flex-col items-center justify-center p-3 text-center relative">
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
                                    <div className="text-slate-950 flex flex-col items-center justify-center space-y-2">
                                        <GraduationCap className="w-14 h-14" />
                                        <p className="text-xs font-black uppercase tracking-wider">{book.publication_type}</p>
                                        <p className="text-[10px] font-semibold text-amber-950 line-clamp-2">{book.prodi}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <span className={`px-3 py-1 font-extrabold rounded-full text-xs border inline-block ${getTypeBadgeClass(book.publication_type)}`}>
                                    {book.publication_type}
                                </span>

                                {book.is_featured && (
                                    <div className="inline-flex items-center space-x-1 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                                        <Star className="w-3.5 h-3.5 fill-purple-600" />
                                        <span>Karya Unggulan Dosen</span>
                                    </div>
                                )}
                            </div>

                            {/* Digital File Download Action */}
                            {book.document_url && (
                                <a
                                    href={book.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Unduh Dokumen / E-Book</span>
                                </a>
                            )}

                            {/* DOI / External Link */}
                            {book.doi_url && (
                                <a
                                    href={book.doi_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-2xl border border-amber-200 shadow-sm transition-all flex items-center justify-center space-x-2"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Tautan DOI / Repositori SINTA</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Full Specifications & Synopsis (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="space-y-3">
                                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Program Studi: {book.prodi}</span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                                    {book.title}
                                </h2>

                                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Tim Penulis / Dosen:</span>
                                    
                                    {(() => {
                                        const authorsList = (book.authors || '')
                                            .split(';')
                                            .map(a => a.trim())
                                            .filter(Boolean);

                                        if (authorsList.length === 0) {
                                            return <p className="text-sm font-black text-slate-900">-</p>;
                                        }

                                        return (
                                            <div className="space-y-2">
                                                {authorsList.map((authorName, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200/60 shadow-xs"
                                                    >
                                                        <div className="flex items-center space-x-2.5">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                                index === 0
                                                                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                            }`}>
                                                                Penulis {index + 1} {index === 0 && '(Utama)'}
                                                            </span>
                                                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                                                                {authorName}
                                                            </span>
                                                        </div>
                                                        {index === 0 && book.nidn && (
                                                            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                                                NIDN: {book.nidn}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Metadata Specs Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ISBN / e-ISBN</span>
                                    <p className="text-xs font-mono font-bold text-slate-800">{book.isbn || '-'}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Penerbit</span>
                                    <p className="text-xs font-bold text-slate-800">{book.publisher || '-'}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tahun & Kota</span>
                                    <p className="text-xs font-bold text-slate-800">
                                        {book.publish_year || '-'} {book.city ? `(${book.city})` : ''}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Edisi / Cetakan</span>
                                    <p className="text-xs font-bold text-slate-800">{book.edition || '-'}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Halaman</span>
                                    <p className="text-xs font-bold text-slate-800">{book.pages ? `${book.pages} Halaman` : '-'}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor HKI / Hak Cipta</span>
                                    <p className="text-xs font-mono font-extrabold text-emerald-700">{book.hki_number || 'Belum Terdaftar'}</p>
                                </div>
                            </div>

                            {/* Synopsis Content */}
                            {book.synopsis && (
                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                                        Sinopsis / Deskripsi Karya
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        {book.synopsis}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Related Books */}
                        {relatedBooks && relatedBooks.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                                    Karya Buku Terkait Lainnya
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {relatedBooks.map((rel) => (
                                        <Link
                                            key={rel.id}
                                            href={`/karya-dosen/${rel.slug || rel.id}`}
                                            className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-2 group"
                                        >
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${getTypeBadgeClass(rel.publication_type)}`}>
                                                {rel.publication_type}
                                            </span>
                                            <p className="font-extrabold text-xs text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                {rel.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 line-clamp-1">
                                                Penulis: {rel.authors}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-12 text-center text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
                    <p>© {new Date().getFullYear()} UPT Perpustakaan Politeknik Indonusa Surakarta.</p>
                </div>
            </footer>
        </div>
    );
}
