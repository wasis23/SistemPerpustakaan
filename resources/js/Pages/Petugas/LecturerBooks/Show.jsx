import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import {
    ArrowLeft,
    GraduationCap,
    Edit3,
    Award,
    BookOpen,
    Calendar,
    Hash,
    Building2,
    ExternalLink,
    FileText,
    Download,
    CheckCircle2,
    Star,
    Layers,
    User
} from 'lucide-react';

export default function LecturerBooksShow({ book }) {
    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Buku Ajar':
                return 'bg-blue-100 text-blue-900 border-blue-200';
            case 'Monograf':
                return 'bg-purple-100 text-purple-900 border-purple-200';
            case 'Buku Referensi':
                return 'bg-emerald-100 text-emerald-900 border-emerald-200';
            case 'Modul Praktikum':
                return 'bg-amber-100 text-amber-900 border-amber-200';
            case 'Book Chapter':
                return 'bg-rose-100 text-rose-900 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <PetugasLayout activeMenu="lecturer-books">
            <Head title={`Detail Karya: ${book.title} - SIMPUS Petugas`} />

            <div className="space-y-8 w-full">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/petugas/lecturer-books"
                            className="p-2.5 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 text-slate-700 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Detail Repositori Karya Dosen</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                                Informasi Karya Buku
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/petugas/lecturer-books/${book.id}/edit`}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center space-x-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Data Karya</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Book Cover & Quick Meta (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-6 text-center">
                            <div className="w-48 h-64 mx-auto rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-md">
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
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <BookOpen className="w-12 h-12 stroke-[1.5]" />
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
                            {book.document_url ? (
                                <a
                                    href={book.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Unduh / Buka Dokumen Digital</span>
                                </a>
                            ) : (
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 text-xs font-medium border border-slate-200">
                                    Dokumen file digital belum diunggah
                                </div>
                            )}

                            {/* DOI Link Action */}
                            {book.doi_url && (
                                <a
                                    href={book.doi_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center space-x-2"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Tautan DOI / SINTA / Repositori</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Full Specifications & Synopsis (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Title & Authors Info Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-sm space-y-6">
                            <div className="space-y-3">
                                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Program Studi: {book.prodi}</span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                                    {book.title}
                                </h2>

                                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                                    <span className="text-[11px] font-bold text-amber-900 block">Penulis / Tim Dosen:</span>
                                    <p className="text-sm font-black text-slate-900">{book.authors}</p>
                                    {book.nidn && (
                                        <p className="text-xs font-mono text-slate-500 font-semibold">NIDN Penulis Utama: {book.nidn}</p>
                                    )}
                                </div>
                            </div>

                            {/* Specification Table */}
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
                                        Sinopsis & Ruang Lingkup Karya
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        {book.synopsis}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
