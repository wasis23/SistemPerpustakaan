import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, 
    BookOpen, 
    Printer, 
    Plus, 
    Minus, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    Tag, 
    MapPin, 
    Loader2 
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Show({ book, copies }) {
    const { flash } = usePage().props;
    const [addCount, setAddCount] = useState(1);
    const [isAddingCopies, setIsAddingCopies] = useState(false);
    const [reduceCount, setReduceCount] = useState(1);
    const [isReducingCopies, setIsReducingCopies] = useState(false);
    const [deletingCopyId, setDeletingCopyId] = useState(null);

    const handleAddCopies = (e) => {
        e.preventDefault();
        setIsAddingCopies(true);
        router.post(`/petugas/books/${book.id}/add-copies`, { count: addCount }, {
            preserveScroll: true,
            onFinish: () => setIsAddingCopies(false),
        });
    };

    const handleReduceCopies = (e) => {
        e.preventDefault();
        const availableCount = copies.filter(c => c.status === 'available').length;
        if (availableCount === 0) {
            alert('Tidak ada eksemplar berstatus Tersedia yang dapat dikurangi.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin mengurangi ${reduceCount} eksemplar fisik yang tersedia?`)) {
            setIsReducingCopies(true);
            router.post(`/petugas/books/${book.id}/reduce-copies`, { count: reduceCount }, {
                preserveScroll: true,
                onFinish: () => setIsReducingCopies(false),
            });
        }
    };

    const handleDeleteSingleCopy = (copy) => {
        if (copy.status === 'borrowed' || copy.status === 'ticketed') {
            alert('Eksemplar sedang dipinjam atau tertahan tiket dan tidak dapat dihapus.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus eksemplar ${copy.copy_code}?`)) {
            setDeletingCopyId(copy.id);
            router.delete(`/petugas/books/${book.id}/copies/${copy.id}`, {
                preserveScroll: true,
                onFinish: () => setDeletingCopyId(null),
            });
        }
    };

    const statusBadge = {
        available: { label: 'Tersedia di Rak', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        ticketed: { label: 'Tertahan Tiket HP', color: 'bg-amber-100 text-amber-800 border-amber-300' },
        borrowed: { label: 'Sedang Dipinjam', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
        damaged: { label: 'Rusak', color: 'bg-rose-100 text-rose-800 border-rose-300' },
        lost: { label: 'Hilang', color: 'bg-slate-200 text-slate-700 border-slate-300' },
    };

    const conditionBadge = {
        good: { label: 'Baik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        fair: { label: 'Cukup', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        damaged: { label: 'Rusak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    };

    const availableCopies = copies.filter(c => c.status === 'available');

    return (
        <PetugasLayout activeMenu="books">
            <Head title={`Detail Buku: ${book.title}`} />

            <div className="space-y-6 w-full pb-12">
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

                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/petugas/books/${book.id}/edit`}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 shrink-0"
                        >
                            <Edit className="w-4 h-4 stroke-[2.5]" />
                            <span>Edit Data Buku & Eksemplar</span>
                        </Link>
                        <Link
                            href={`/petugas/books/${book.id}/print-barcodes`}
                            target="_blank"
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 shrink-0"
                        >
                            <Printer className="w-4 h-4 stroke-[2.5]" />
                            <span>Cetak Barcode Label PDF</span>
                        </Link>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{flash.error}</span>
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
                            {book.call_number && (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono font-black flex items-center space-x-1">
                                    <Tag className="w-3 h-3 shrink-0" />
                                    <span>Call No: {book.call_number}</span>
                                </span>
                            )}
                            <span className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{book.rack?.code_rack} - {book.rack?.location}</span>
                            </span>
                        </div>

                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">{book.title}</h2>
                        <p className="text-xs text-slate-700">Penulis: <strong className="text-slate-950 font-extrabold">{book.author}</strong></p>
                        <p className="text-xs text-slate-500 font-medium">
                            Penerbit: {book.publisher || '-'} | Terbit: {book.publish_year || '-'} | Pengadaan: <strong className="text-amber-800 font-bold">{book.procurement_month ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][book.procurement_month - 1] + ' ' : ''}{book.procurement_year || book.publish_year || '-'}</strong>
                        </p>

                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-6 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Eksemplar</span>
                                    <span className="font-black text-slate-950 text-xl">{copies.length}</span>
                                </div>
                                <div className="border-l border-slate-200 pl-6">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tersedia</span>
                                    <span className="font-black text-emerald-700 text-xl">
                                        {availableCopies.length}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Add and Reduce Actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Form Tambah Eksemplar */}
                                <form onSubmit={handleAddCopies} className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={addCount}
                                        onChange={(e) => setAddCount(e.target.value)}
                                        className="w-14 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                                        title="Jumlah eksemplar yang ingin ditambah"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isAddingCopies}
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center space-x-1 shadow-sm transition-all disabled:opacity-50"
                                    >
                                        {isAddingCopies ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                        )}
                                        <span>Tambah</span>
                                    </button>
                                </form>

                                {/* Form Kurangi Eksemplar */}
                                <form onSubmit={handleReduceCopies} className="flex items-center space-x-1.5 bg-rose-50/60 p-1.5 rounded-2xl border border-rose-200">
                                    <input
                                        type="number"
                                        min="1"
                                        max={Math.max(1, availableCopies.length)}
                                        value={reduceCount}
                                        onChange={(e) => setReduceCount(e.target.value)}
                                        className="w-14 px-2 py-1.5 bg-white border border-rose-300 rounded-xl text-slate-900 text-xs font-mono text-center font-bold focus:outline-none focus:border-rose-500"
                                        title="Jumlah eksemplar yang ingin dikurangi"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isReducingCopies || availableCopies.length === 0}
                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl flex items-center space-x-1 shadow-sm transition-all disabled:opacity-50"
                                    >
                                        {isReducingCopies ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                        )}
                                        <span>Kurangi</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copies Grid */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>Daftar Eksemplar Fisik & Barcode Hash ({copies.length})</span>
                        </h3>
                        <Link
                            href={`/petugas/books/${book.id}/edit`}
                            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Kelola Eksemplar di Halaman Edit</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {copies.map((copy) => {
                            const badge = statusBadge[copy.status] || { label: copy.status, color: 'bg-slate-100 text-slate-800' };
                            const condBadge = conditionBadge[copy.condition] || { label: copy.condition, color: 'bg-slate-50 text-slate-700' };
                            const isBusy = copy.status === 'borrowed' || copy.status === 'ticketed';
                            const isDeleting = deletingCopyId === copy.id;

                            return (
                                <div key={copy.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all shadow-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-mono font-black text-amber-950 text-xs tracking-tight break-all">{copy.copy_code}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                    <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                    <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold ${condBadge.color}`}>
                                                        {condBadge.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isBusy || isDeleting}
                                                onClick={() => handleDeleteSingleCopy(copy)}
                                                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={isBusy ? 'Tidak dapat dihapus saat dipinjam / tiket' : 'Hapus eksemplar ini'}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
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

                                    <div className="text-[10px] text-slate-400 font-medium pt-1 flex items-center justify-between border-t border-slate-200/60">
                                        <span>Dibuat: {copy.created_at}</span>
                                        <span className="font-mono">ID #{copy.id}</span>
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
