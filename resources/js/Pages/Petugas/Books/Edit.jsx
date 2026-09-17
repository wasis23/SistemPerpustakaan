import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, 
    BookOpen, 
    Save, 
    Sparkles, 
    Upload, 
    Image as ImageIcon,
    Search,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Printer,
    Eye,
    Plus,
    Minus,
    Trash2,
    Tag,
    MapPin,
    QrCode,
    RefreshCw,
    Edit3
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Edit({ book, copies: initialCopies, categories: initialCategories, racks }) {
    const { flash } = usePage().props;
    const [categories, setCategories] = useState(initialCategories || []);
    const [copies, setCopies] = useState(initialCopies || []);
    const [coverPreview, setCoverPreview] = useState(book.cover_image || null);
    const [searchQuery, setSearchQuery] = useState(book.isbn || '');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResultInfo, setSearchResultInfo] = useState(null);

    // Form Tambah Eksemplar
    const [addCount, setAddCount] = useState(1);
    const [isAddingCopies, setIsAddingCopies] = useState(false);

    // Form Kurangi Eksemplar
    const [reduceCount, setReduceCount] = useState(1);
    const [isReducingCopies, setIsReducingCopies] = useState(false);

    // Edit Copy Modal / State
    const [selectedCopy, setSelectedCopy] = useState(null);
    const [copyCondition, setCopyCondition] = useState('good');
    const [copyStatus, setCopyStatus] = useState('available');
    const [isUpdatingCopy, setIsUpdatingCopy] = useState(false);

    // Delete single copy loading
    const [deletingCopyId, setDeletingCopyId] = useState(null);

    const MONTHS = [
        { value: 1, label: 'Januari (I)', roman: 'I' },
        { value: 2, label: 'Februari (II)', roman: 'II' },
        { value: 3, label: 'Maret (III)', roman: 'III' },
        { value: 4, label: 'April (IV)', roman: 'IV' },
        { value: 5, label: 'Mei (V)', roman: 'V' },
        { value: 6, label: 'Juni (VI)', roman: 'VI' },
        { value: 7, label: 'Juli (VII)', roman: 'VII' },
        { value: 8, label: 'Agustus (VIII)', roman: 'VIII' },
        { value: 9, label: 'September (IX)', roman: 'IX' },
        { value: 10, label: 'Oktober (X)', roman: 'X' },
        { value: 11, label: 'November (XI)', roman: 'XI' },
        { value: 12, label: 'Desember (XII)', roman: 'XII' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        isbn: book.isbn || '',
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        publish_year: book.publish_year || '',
        procurement_month: book.procurement_month || new Date().getMonth() + 1,
        procurement_year: book.procurement_year || book.publish_year || new Date().getFullYear(),
        category_id: book.category_id || (categories[0]?.id || ''),
        rack_id: book.rack_id || (racks[0]?.id || ''),
        call_number: book.call_number || '',
        cover_image: null,
        cover_url: '',
        remove_cover: false,
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

    const handleTitleChange = (val) => {
        setData(prev => ({
            ...prev,
            title: val,
        }));
    };

    const handleAuthorChange = (val) => {
        setData(prev => ({
            ...prev,
            author: val,
        }));
    };

    const handleCategoryChange = (val) => {
        setData(prev => ({
            ...prev,
            category_id: val,
        }));
    };

    const handleGenerateCallNumber = () => {
        const autoCallNo = calculateCallNumber(data.title, data.author, data.category_id);
        if (autoCallNo) {
            setData('call_number', autoCallNo);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData(prev => ({ ...prev, cover_image: file, cover_url: '', remove_cover: false }));
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveCover = () => {
        setData(prev => ({ ...prev, cover_image: null, cover_url: '', remove_cover: true }));
        setCoverPreview(null);
    };

    // Fetch data dari API katalog via ISBN
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
                    remove_cover: false,
                }));

                if (b.cover_url) {
                    setCoverPreview(b.cover_url);
                }

                setSearchResultInfo({
                    type: 'success',
                    message: `Berhasil mengisi data buku via ${json.source}!`,
                });
            } else {
                setSearchResultInfo({
                    type: 'error',
                    message: json.message || 'Buku tidak ditemukan di layanan katalog eksternal.',
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
        post(`/petugas/books/${book.id}`, {
            forceFormData: true,
        });
    };

    // Tambah Eksemplar
    const handleAddCopies = (e) => {
        e.preventDefault();
        setIsAddingCopies(true);
        router.post(`/petugas/books/${book.id}/add-copies`, { count: addCount }, {
            preserveScroll: true,
            onFinish: () => setIsAddingCopies(false),
        });
    };

    // Kurangi Eksemplar
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

    // Hapus 1 Eksemplar Tertentu
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

    // Buka Modal Edit Status / Kondisi Eksemplar
    const openEditCopyModal = (copy) => {
        setSelectedCopy(copy);
        setCopyCondition(copy.condition || 'good');
        setCopyStatus(copy.status || 'available');
    };

    const handleSaveCopyStatus = (e) => {
        e.preventDefault();
        if (!selectedCopy) return;

        setIsUpdatingCopy(true);
        router.put(`/petugas/books/${book.id}/copies/${selectedCopy.id}`, {
            condition: copyCondition,
            status: copyStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedCopy(null);
            },
            onFinish: () => setIsUpdatingCopy(false),
        });
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

    const availableCopiesCount = copies.filter(c => c.status === 'available').length;

    return (
        <PetugasLayout activeMenu="books">
            <Head title={`Edit Buku: ${book.title}`} />

            <div className="space-y-6 w-full pb-16">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <Link href="/petugas/books" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight line-clamp-1">Edit Data Buku</h1>
                            <p className="text-xs text-slate-500 font-medium">Perbarui informasi bibliografi buku dan kelola penambahan/pengurangan eksemplar fisik</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/petugas/books/${book.id}`}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center space-x-1.5"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Lihat Detail</span>
                        </Link>
                        <Link
                            href={`/petugas/books/${book.id}/print-barcodes`}
                            target="_blank"
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Barcode</span>
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

                {/* Top Widget: Auto-Fill Scanner via ISBN */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-900/40 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-1">
                        <h2 className="text-base font-black tracking-tight flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Sinkronisasi Otomatis Data via ISBN</span>
                        </h2>
                        <p className="text-xs text-slate-300">
                            Masukkan barcode ISBN untuk mencari ulang atau melengkapi metadata buku otomatis dari katalog eksternal
                        </p>
                    </div>

                    <form onSubmit={handleFetchGlobalKatalog} className="relative z-10 flex flex-col sm:flex-row gap-3 pt-1">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Scan barcode ISBN (misal: 9786020531328)..."
                                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs font-semibold font-mono"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mencari ISBN...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    <span>AMBIL DATA ISBN</span>
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

                {/* Main Edit Form Container */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-lg font-black text-slate-950 flex items-center space-x-2">
                            <Edit3 className="w-5 h-5 text-amber-600" />
                            <span>Informasi Bibliografi Buku</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Ubah rincian judul, pengarang, penerbit, nomor panggil, dan lokasi penempatan rak</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Upload Cover Buku */}
                            <div className="sm:col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                                    <ImageIcon className="w-4 h-4 text-amber-600" />
                                    <span>Sampul Buku (Cover Image)</span>
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {coverPreview ? (
                                        <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md group shrink-0">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveCover}
                                                className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow hover:bg-rose-700 transition-colors"
                                                title="Hapus gambar sampul"
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
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold shadow cursor-pointer transition-all"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span>Ganti File Sampul</span>
                                            </label>
                                            {coverPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveCover}
                                                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Hapus Sampul</span>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Format file: JPG, PNG, atau WebP. Maksimal 2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nomor ISBN */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Nomor ISBN
                                </label>
                                <input
                                    type="text"
                                    value={data.isbn}
                                    onChange={(e) => setData('isbn', e.target.value)}
                                    placeholder="Contoh: 978-602-05-3132-8"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.isbn ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-mono font-bold`}
                                />
                                {errors.isbn && <p className="text-[10px] text-rose-600 font-bold">{errors.isbn}</p>}
                            </div>

                            {/* Judul Buku */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Judul Lengkap Buku <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Contoh: Belajar Pemrograman Web Modern"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-bold`}
                                />
                                {errors.title && <p className="text-[10px] text-rose-600 font-bold">{errors.title}</p>}
                            </div>

                            {/* Pengarang / Penulis */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Pengarang / Penulis <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.author}
                                    onChange={(e) => handleAuthorChange(e.target.value)}
                                    placeholder="Contoh: Andi Wijaya"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.author ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-bold`}
                                />
                                {errors.author && <p className="text-[10px] text-rose-600 font-bold">{errors.author}</p>}
                            </div>

                            {/* Penerbit */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Penerbit
                                </label>
                                <input
                                    type="text"
                                    value={data.publisher}
                                    onChange={(e) => setData('publisher', e.target.value)}
                                    placeholder="Contoh: Informatika Bandung"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.publisher ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium`}
                                />
                                {errors.publisher && <p className="text-[10px] text-rose-600 font-bold">{errors.publisher}</p>}
                            </div>

                            {/* Tahun Terbit */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Tahun Terbit
                                </label>
                                <input
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    value={data.publish_year}
                                    onChange={(e) => setData('publish_year', e.target.value)}
                                    placeholder="Contoh: 2024"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.publish_year ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-bold font-mono`}
                                />
                                {errors.publish_year && <p className="text-[10px] text-rose-600 font-bold">{errors.publish_year}</p>}
                            </div>

                            {/* Bulan & Tahun Pengadaan */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">
                                        Bulan Pengadaan
                                    </label>
                                    <select
                                        value={data.procurement_month}
                                        onChange={(e) => setData('procurement_month', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">
                                        Tahun Pengadaan
                                    </label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        value={data.procurement_year}
                                        onChange={(e) => setData('procurement_year', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-bold font-mono"
                                    />
                                </div>
                            </div>

                            {/* Kategori DDC */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Kategori DDC <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.category_id}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.category_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-semibold`}
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            [{c.code}] {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-[10px] text-rose-600 font-bold">{errors.category_id}</p>}
                            </div>

                            {/* Lokasi Rak Fisik */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Lokasi Rak Buku <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.rack_id}
                                    onChange={(e) => setData('rack_id', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.rack_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-semibold`}
                                >
                                    {racks.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.code_rack} - {r.location} {r.laboratory ? `(${r.laboratory.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.rack_id && <p className="text-[10px] text-rose-600 font-bold">{errors.rack_id}</p>}
                            </div>

                            {/* Nomor Panggil (Call Number) */}
                            <div className="sm:col-span-2 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-800">
                                        Nomor Panggil (Call Number)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateCallNumber}
                                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>Hitung Otomatis dari DDC & Penulis</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={data.call_number}
                                    onChange={(e) => setData('call_number', e.target.value)}
                                    placeholder="Contoh: 004 AND b"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.call_number ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-mono font-bold`}
                                />
                                <p className="text-[10px] text-slate-500">
                                    Format standar: [Kode DDC] [3 Huruf Kapital Pengarang] [1 Huruf Kecil Judul]. Contoh: <strong>004 AND b</strong>
                                </p>
                                {errors.call_number && <p className="text-[10px] text-rose-600 font-bold">{errors.call_number}</p>}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                            <Link
                                href="/petugas/books"
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs shadow transition-all flex items-center space-x-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>SIMPAN PERUBAHAN BUKU</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Eksemplar Management Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <h2 className="text-lg font-black text-slate-950 flex items-center space-x-2">
                                <Tag className="w-5 h-5 text-amber-600" />
                                <span>Manajemen Eksemplar Fisik & Barcode ({copies.length})</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Tambah eksemplar baru, kurangi eksemplar yang tersedia, atau atur status & kondisi masing-masing fisik
                            </p>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex items-center space-x-4 text-xs font-bold">
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                <span className="text-slate-500 text-[10px] block uppercase">Total</span>
                                <span className="text-slate-950 text-sm font-black">{copies.length}</span>
                            </div>
                            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <span className="text-emerald-700 text-[10px] block uppercase">Tersedia</span>
                                <span className="text-emerald-800 text-sm font-black">{availableCopiesCount}</span>
                            </div>
                            <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                                <span className="text-indigo-700 text-[10px] block uppercase">Dipinjam/Tiket</span>
                                <span className="text-indigo-800 text-sm font-black">
                                    {copies.filter(c => c.status === 'borrowed' || c.status === 'ticketed').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards: Tambah & Kurangi Eksemplar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Form Tambah Eksemplar */}
                        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-950">Tambah Eksemplar Fisik Baru</h3>
                                    <p className="text-[10px] text-slate-600">Barcode dan Nomor Inventaris akan dibuat otomatis</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddCopies} className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <span className="text-xs font-bold text-slate-700">Jumlah:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={addCount}
                                        onChange={(e) => setAddCount(e.target.value)}
                                        className="w-16 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isAddingCopies}
                                    className="flex-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isAddingCopies ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    )}
                                    <span>Tambah Eksemplar</span>
                                </button>
                            </form>
                        </div>

                        {/* Form Kurangi Eksemplar */}
                        <div className="bg-rose-50/50 p-4 sm:p-5 rounded-2xl border border-rose-200/80 space-y-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 bg-rose-100 text-rose-800 rounded-lg flex items-center justify-center">
                                    <Minus className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-950">Kurangi Jumlah Eksemplar</h3>
                                    <p className="text-[10px] text-slate-600">Hanya menghapus eksemplar berstatus 'Tersedia di Rak'</p>
                                </div>
                            </div>

                            <form onSubmit={handleReduceCopies} className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <span className="text-xs font-bold text-slate-700">Jumlah:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={Math.max(1, availableCopiesCount)}
                                        value={reduceCount}
                                        onChange={(e) => setReduceCount(e.target.value)}
                                        className="w-16 px-2.5 py-1.5 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:border-rose-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isReducingCopies || availableCopiesCount === 0}
                                    className="flex-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isReducingCopies ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                    )}
                                    <span>Kurangi Eksemplar</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Copies List / Grid */}
                    <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Daftar Eksemplar Fisik & Barcode Hash
                        </h3>

                        {copies.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs font-bold">Belum ada eksemplar fisik untuk buku ini.</p>
                                <p className="text-[11px] mt-1">Gunakan form di atas untuk menambahkan eksemplar fisik.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {copies.map((copy) => {
                                    const badge = statusBadge[copy.status] || { label: copy.status, color: 'bg-slate-100 text-slate-800' };
                                    const condBadge = conditionBadge[copy.condition] || { label: copy.condition, color: 'bg-slate-50 text-slate-700' };
                                    const isBusy = copy.status === 'borrowed' || copy.status === 'ticketed';
                                    const isDeleting = deletingCopyId === copy.id;

                                    return (
                                        <div 
                                            key={copy.id} 
                                            className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all shadow-sm"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-mono font-black text-amber-950 text-xs tracking-tight break-all">
                                                            {copy.copy_code}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold ${condBadge.color}`}>
                                                                {condBadge.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditCopyModal(copy)}
                                                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-white rounded-lg border border-slate-200 transition-all"
                                                            title="Ubah Kondisi & Status"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
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
                                                </div>

                                                {/* Rendered Barcode SVG */}
                                                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-inner">
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
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Edit Status & Kondisi Eksemplar */}
            {selectedCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-950">Ubah Eksemplar</h3>
                            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                {selectedCopy.copy_code}
                            </span>
                        </div>

                        <form onSubmit={handleSaveCopyStatus} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Kondisi Fisik Buku
                                </label>
                                <select
                                    value={copyCondition}
                                    onChange={(e) => setCopyCondition(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                                >
                                    <option value="good">Baik (Siap Dipinjam)</option>
                                    <option value="fair">Cukup (Sedikit Lusuh)</option>
                                    <option value="damaged">Rusak (Halaman Robek/Lepas)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Status Ketersediaan
                                </label>
                                <select
                                    value={copyStatus}
                                    onChange={(e) => setCopyStatus(e.target.value)}
                                    disabled={selectedCopy.status === 'borrowed' || selectedCopy.status === 'ticketed'}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {selectedCopy.status === 'borrowed' ? (
                                        <option value="borrowed">Sedang Dipinjam</option>
                                    ) : selectedCopy.status === 'ticketed' ? (
                                        <option value="ticketed">Tertahan Tiket Mandiri</option>
                                    ) : (
                                        <>
                                            <option value="available">Tersedia di Rak</option>
                                            <option value="damaged">Rusak (Tidak Dipinjamkan)</option>
                                            <option value="lost">Hilang (Tidak Ada di Rak)</option>
                                        </>
                                    )}
                                </select>
                                {(selectedCopy.status === 'borrowed' || selectedCopy.status === 'ticketed') && (
                                    <p className="text-[10px] text-amber-700 font-medium">
                                        Status tidak dapat diubah manual saat sedang dalam sirkulasi peminjaman/tiket aktif.
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCopy(null)}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingCopy}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow transition-all flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    {isUpdatingCopy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Simpan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
