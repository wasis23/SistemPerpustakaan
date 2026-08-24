import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Save, Plus, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Create({ categories, racks }) {
    const [coverPreview, setCoverPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publish_year: new Date().getFullYear(),
        category_id: categories[0]?.id || '',
        rack_id: racks[0]?.id || '',
        initial_copies: 2,
        cover_image: null,
    });

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/petugas/books');
    };

    return (
        <PetugasLayout activeMenu="books">
            <Head title="Tambah Katalog Buku - Petugas" />

            <div className="max-w-4xl mx-auto space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex items-center space-x-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <Link href="/petugas/books" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Tambah Judul Buku & Eksemplar</h1>
                        <p className="text-xs text-slate-500 font-medium">Input data induk koleksi, upload cover, dan pembuatan barcode fisik otomatis</p>
                    </div>
                </div>

                {/* Main Form Container */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Upload Cover Buku */}
                            <div className="sm:col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                                    <ImageIcon className="w-4 h-4 text-amber-600" />
                                    <span>Upload Cover Sampul Buku (Opsional)</span>
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {coverPreview ? (
                                        <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md group shrink-0">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('cover_image', null);
                                                    setCoverPreview(null);
                                                }}
                                                className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-28 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                                            <BookOpen className="w-8 h-8 mb-1" />
                                            <span className="text-[10px] font-bold">Tanpa Sampul</span>
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="file"
                                            id="cover_image_input"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handleCoverChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="cover_image_input"
                                            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold shadow cursor-pointer transition-all"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Pilih Gambar Sampul Buku</span>
                                        </label>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Format yang didukung: JPG, PNG, WEBP. Ukuran maksimal: 2 MB.
                                        </p>
                                        {errors.cover_image && <p className="text-xs text-rose-600 font-bold">{errors.cover_image}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Judul Buku */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Judul Buku <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Pemrograman Web dengan Laravel 11 & React"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                                    required
                                />
                                {errors.title && <p className="text-xs text-rose-600 font-bold mt-1">{errors.title}</p>}
                            </div>

                            {/* Penulis / Pengarang */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Penulis / Pengarang <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.author}
                                    onChange={(e) => setData('author', e.target.value)}
                                    placeholder="Contoh: Dr. Rahmat Hidayat, M.T."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                                    required
                                />
                                {errors.author && <p className="text-xs text-rose-600 font-bold mt-1">{errors.author}</p>}
                            </div>

                            {/* ISBN */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Kode ISBN (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={data.isbn}
                                    onChange={(e) => setData('isbn', e.target.value)}
                                    placeholder="Contoh: 978-602-04-9812-1"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-mono font-bold"
                                />
                                {errors.isbn && <p className="text-xs text-rose-600 font-bold mt-1">{errors.isbn}</p>}
                            </div>

                            {/* Penerbit */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Penerbit
                                </label>
                                <input
                                    type="text"
                                    value={data.publisher}
                                    onChange={(e) => setData('publisher', e.target.value)}
                                    placeholder="Contoh: Informatika Press"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                                />
                            </div>

                            {/* Tahun Terbit */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Tahun Terbit
                                </label>
                                <input
                                    type="number"
                                    value={data.publish_year}
                                    onChange={(e) => setData('publish_year', e.target.value)}
                                    placeholder="2024"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-mono font-bold"
                                />
                            </div>

                            {/* Kategori DDC */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Kategori DDC <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Rak Lokasi */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Lokasi Rak Fisik <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={data.rack_id}
                                    onChange={(e) => setData('rack_id', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                                    required
                                >
                                    {racks.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.code_rack} - {r.location} {r.laboratory ? `(${r.laboratory.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Jumlah Eksemplar Fisik */}
                            <div className="sm:col-span-2 bg-amber-50/70 p-5 rounded-3xl border border-amber-200 space-y-2">
                                <label className="block text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    <span>Generasi Eksemplar Fisik Awal</span>
                                </label>
                                <p className="text-xs text-amber-800 font-medium">Sistem akan membuat kode eksemplar & label barcode hash unik secara otomatis.</p>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={data.initial_copies}
                                    onChange={(e) => setData('initial_copies', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-amber-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm font-black font-mono shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                            <Link href="/petugas/books" className="px-5 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold transition-all">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-extrabold shadow-lg transition-all flex items-center space-x-2"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'Menyimpan Buku...' : 'SIMPAN BUKU & EKSEMPLAR'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PetugasLayout>
    );
}
