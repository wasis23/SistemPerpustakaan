import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    BookOpen, 
    Save, 
    Sparkles, 
    Upload, 
    Image as ImageIcon,
    Search,
    Loader2,
    Globe,
    CheckCircle2,
    AlertCircle,
    Hash
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Create({ categories: initialCategories, racks }) {
    const [categories, setCategories] = useState(initialCategories || []);
    const [coverPreview, setCoverPreview] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResultInfo, setSearchResultInfo] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publish_year: new Date().getFullYear(),
        procurement_year: new Date().getFullYear(),
        category_id: categories[0]?.id || '',
        rack_id: racks[0]?.id || '',
        call_number: '',
        initial_copies: 2,
        cover_image: null,
        cover_url: '',
    });

    // Helper untuk kalkulasi Call Number: [DDC] [3-Huruf Penulis] [1-Huruf Judul (kecil)]
    const calculateCallNumber = (titleVal, authorVal, catIdVal) => {
        if (!titleVal || !authorVal) return '';
        const categoryObj = categories.find(c => String(c.id) === String(catIdVal));
        const ddc = categoryObj ? categoryObj.code : '000';
        
        const cleanAuthor = authorVal.replace(/[^A-Za-z]/g, '').toUpperCase();
        const authorCode = cleanAuthor.substring(0, 3).padEnd(3, 'X');

        const cleanTitle = titleVal.replace(/[^A-Za-z]/g, '').toLowerCase();
        const titleCode = cleanTitle.substring(0, 1) || 'a';

        return `${ddc} ${authorCode} ${titleCode}`;
    };

    // Auto-update Call Number saat Judul, Penulis, atau Kategori diubah manual
    const handleTitleChange = (val) => {
        setData(prev => {
            const nextCallNumber = prev.call_number || calculateCallNumber(val, prev.author, prev.category_id);
            return { ...prev, title: val, call_number: nextCallNumber };
        });
    };

    const handleAuthorChange = (val) => {
        setData(prev => {
            const nextCallNumber = prev.call_number || calculateCallNumber(prev.title, val, prev.category_id);
            return { ...prev, author: val, call_number: nextCallNumber };
        });
    };

    const handleCategoryChange = (val) => {
        setData(prev => {
            const nextCallNumber = calculateCallNumber(prev.title, prev.author, val);
            return { ...prev, category_id: val, call_number: nextCallNumber };
        });
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData(prev => ({ ...prev, cover_image: file, cover_url: '' }));
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    // Fetch data dari Open Library API -> Indonesia OneSearch Fallback (Hanya via ISBN)
    const handleFetchGlobalKatalog = async (e) => {
        e?.preventDefault();
        const cleanQuery = searchQuery.replace(/[^0-9X]/gi, '');
        if (!cleanQuery) return;

        if (cleanQuery.length < 9) {
            setSearchResultInfo({
                type: 'error',
                message: 'Silakan masukkan nomor barcode ISBN yang valid (10 atau 13 digit angka).',
            });
            return;
        }

        setIsSearching(true);
        setSearchResultInfo(null);

        try {
            const res = await fetch(`/petugas/books/fetch-api?query=${encodeURIComponent(cleanQuery)}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const json = await res.json();

            if (json.success) {
                const b = json.data;
                if (json.categories) {
                    setCategories(json.categories);
                }

                setData(prev => ({
                    ...prev,
                    title: b.title || prev.title,
                    author: b.author || prev.author,
                    publisher: b.publisher || prev.publisher,
                    publish_year: b.publish_year || prev.publish_year,
                    isbn: b.isbn || cleanQuery || prev.isbn,
                    category_id: b.category_id || prev.category_id,
                    call_number: b.call_number || calculateCallNumber(b.title, b.author, b.category_id),
                    cover_url: b.cover_url || prev.cover_url,
                    cover_image: null,
                }));

                if (b.cover_url) {
                    setCoverPreview(b.cover_url);
                }

                setSearchResultInfo({
                    type: 'success',
                    message: `Berhasil menemukan data buku via ${json.source}!`,
                });
            } else {
                setSearchResultInfo({
                    type: 'error',
                    message: json.message || 'Buku tidak ditemukan di Open Library maupun Indonesia OneSearch.',
                });
            }
        } catch (err) {
            setSearchResultInfo({
                type: 'error',
                message: 'Gagal terhubung ke layanan API katalog. Silakan isi form secara manual.',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/petugas/books');
    };

    return (
        <PetugasLayout activeMenu="books">
            <Head title="Tambah Katalog Buku - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex items-center space-x-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <Link href="/petugas/books" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Tambah Judul Buku & Eksemplar</h1>
                        <p className="text-xs text-slate-500 font-medium">Input data induk koleksi, auto-fill ISBN Open Library & OneSearch, dan generasi barcode fisik otomatis</p>
                    </div>
                </div>

                {/* Top Widget: Auto-Fill Scanner via Open Library & Indonesia OneSearch */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-900/40 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                            <Globe className="w-3.5 h-3.5 text-amber-400" />
                            <span>Auto-Fill Barcode ISBN (Open Library & Indonesia OneSearch)</span>
                        </div>
                        <h2 className="text-lg font-black tracking-tight">
                            Pindai Barcode ISBN Buku
                        </h2>
                    </div>

                    <form onSubmit={handleFetchGlobalKatalog} className="relative z-10 flex flex-col sm:flex-row gap-3 pt-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Scan barcode ISBN (misal: 9786020531328 atau 9786024125189)..."
                                className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs font-semibold font-mono"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mencari ISBN...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>SCAN & CARI ISBN</span>
                                </>
                            )}
                        </button>
                    </form>

                    {searchResultInfo && (
                        <div className={`relative z-10 p-3.5 rounded-2xl border text-xs font-semibold flex items-center space-x-2.5 ${
                            searchResultInfo.type === 'success' 
                                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' 
                                : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
                        }`}>
                            {searchResultInfo.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span>{searchResultInfo.message}</span>
                        </div>
                    )}
                </div>

                {/* Main Form Container */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Upload Cover Buku */}
                            <div className="sm:col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                                    <ImageIcon className="w-4 h-4 text-amber-600" />
                                    <span>Sampul Buku (Cover Image / URL API)</span>
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {coverPreview ? (
                                        <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md group shrink-0">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData(prev => ({ ...prev, cover_image: null, cover_url: '' }));
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
                                        <div className="flex flex-wrap gap-2">
                                            <label
                                                htmlFor="cover_image_input"
                                                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold shadow cursor-pointer transition-all"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span>Pilih File Sampul Manual</span>
                                            </label>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            {data.cover_url ? (
                                                <span className="text-emerald-700 font-bold">✓ Sampul terhubung dari Open Library API.</span>
                                            ) : (
                                                'Format yang didukung: JPG, PNG, WEBP. Ukuran maksimal: 2 MB.'
                                            )}
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
                                    onChange={(e) => handleTitleChange(e.target.value)}
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
                                    onChange={(e) => handleAuthorChange(e.target.value)}
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

                            {/* Tahun Terbit & Tahun Pengadaan */}
                            <div className="grid grid-cols-2 gap-3">
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
                                    {errors.publish_year && <p className="text-xs text-rose-600 font-bold mt-1">{errors.publish_year}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        <span>Tahun Pengadaan</span>
                                        <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-1.5 py-0.5 rounded">Barcode INDO[YY]</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.procurement_year}
                                        onChange={(e) => setData('procurement_year', e.target.value)}
                                        placeholder={new Date().getFullYear().toString()}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-mono font-bold"
                                    />
                                    {errors.procurement_year && <p className="text-xs text-rose-600 font-bold mt-1">{errors.procurement_year}</p>}
                                </div>
                            </div>

                            {/* Kategori DDC */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                    Kategori DDC <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nomor Panggil (Call Number) */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span className="flex items-center space-x-1">
                                        <Hash className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Nomor Panggil (Call Number)</span>
                                    </span>
                                    <span className="text-[10px] text-amber-700 font-bold lowercase">Format: DDC 3Penulis 1judul</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.call_number}
                                    onChange={(e) => setData('call_number', e.target.value)}
                                    placeholder="Contoh: 005.1 MAR c"
                                    className="w-full px-4 py-3 bg-amber-50/60 border border-amber-300 rounded-2xl text-slate-950 focus:outline-none focus:border-amber-500 text-xs font-mono font-black"
                                />
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
