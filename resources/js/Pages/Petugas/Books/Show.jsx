import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Printer, Plus, CheckCircle2, QrCode, Tag, MapPin, Layers, Sparkles } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Show({ book, copies }) {
    const { flash } = usePage().props;
    const [addCount, setAddCount] = useState(1);

    const { post, processing } = useForm({});

    const handleAddCopies = (e) => {
        e.preventDefault();
        post(`/petugas/books/${book.id}/add-copies?count=${addCount}`);
    };

    const statusBadge = {
        available: { label: 'Tersedia di Rak', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        ticketed: { label: 'Tertahan Tiket HP', color: 'bg-amber-100 text-amber-800 border-amber-300' },
        borrowed: { label: 'Sedang Dipinjam', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
        damaged: { label: 'Rusak', color: 'bg-rose-100 text-rose-800 border-rose-300' },
        lost: { label: 'Hilang', color: 'bg-slate-200 text-slate-700 border-slate-300' },
    };

    return (
        <PetugasLayout activeMenu="books">
            <Head title={`Detail Buku: ${book.title}`} />

            <div className="space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <Link href="/petugas/books" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight line-clamp-1">{book.title}</h1>
                            <p className="text-xs text-slate-500 font-medium">Pengelolaan & Cetak Label Barcode Eksemplar Fisik</p>
                        </div>
                    </div>

                    <Link
                        href={`/petugas/books/${book.id}/print-barcodes`}
                        target="_blank"
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 shrink-0"
                    >
                        <Printer className="w-4 h-4 stroke-[2.5]" />
                        <span>Cetak Barcode Label PDF</span>
                    </Link>
                </div>

                {/* Flash Success Message */}
                {flash.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Book Summary Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3 flex justify-center">
                        {book.cover_image ? (
                            <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-44 h-60 object-cover rounded-3xl border border-amber-200 shadow-md"
                            />
                        ) : (
                            <div className="w-44 h-60 bg-amber-500/10 border border-amber-200 rounded-3xl flex flex-col items-center justify-center p-4 text-center shadow-inner">
                                <BookOpen className="w-12 h-12 text-amber-700 mb-2" />
                                <p className="text-xs font-extrabold text-slate-900 line-clamp-2">{book.title}</p>
                                <span className="text-[10px] text-amber-900 font-mono font-bold mt-1">ISBN: {book.isbn || '-'}</span>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-9 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                                [{book.category?.code}] {book.category?.name}
                            </span>
                            <span className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                📍 {book.rack?.code_rack} - {book.rack?.location}
                            </span>
                        </div>

                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">{book.title}</h2>
                        <p className="text-xs text-slate-700">Penulis: <strong className="text-slate-950 font-extrabold">{book.author}</strong></p>
                        <p className="text-xs text-slate-500 font-medium">Penerbit: {book.publisher || '-'} ({book.publish_year || '-'})</p>

                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-6 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Eksemplar</span>
                                    <span className="font-black text-slate-950 text-xl">{copies.length}</span>
                                </div>
                                <div className="border-l border-slate-200 pl-6">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tersedia</span>
                                    <span className="font-black text-emerald-700 text-xl">
                                        {copies.filter(c => c.status === 'available').length}
                                    </span>
                                </div>
                            </div>

                            {/* Form Add Copies */}
                            <form onSubmit={handleAddCopies} className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={addCount}
                                    onChange={(e) => setAddCount(e.target.value)}
                                    className="w-16 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center space-x-1 shadow-sm transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Tambah Eksemplar</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Copies Grid */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <span>Daftar Eksemplar Fisik & Barcode Hash ({copies.length})</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {copies.map((copy) => {
                            const badge = statusBadge[copy.status] || { label: copy.status, color: 'bg-slate-100 text-slate-800' };
                            return (
                                <div key={copy.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-mono font-black text-amber-900 text-sm">{copy.copy_code}</p>
                                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                                            Kondisi: {copy.condition}
                                        </span>
                                    </div>

                                    {/* Rendered Barcode SVG */}
                                    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                        <div
                                            className="w-full flex justify-center overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: copy.barcode_svg }}
                                        />
                                        <p className="font-mono text-[10px] text-slate-950 font-black mt-1 tracking-wider">
                                            {copy.barcode_hash}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
