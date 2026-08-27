import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import {
    ArrowLeft,
    GraduationCap,
    Save,
    Image,
    UploadCloud,
    FileText,
    Award,
    BookOpen,
    Calendar,
    Hash,
    Building2,
    Link as LinkIcon,
    Star,
    Sparkles,
    CheckCircle2,
    Eye,
    Search,
    ChevronDown
} from 'lucide-react';

export default function LecturerBooksEdit({ book, prodiList = [], publicationTypes = [], siakadLecturers = [] }) {
    const { data, setData, processing, errors } = useForm({
        title: book.title || '',
        slug: book.slug || '',
        authors: book.authors || '',
        nidn: book.nidn || '',
        user_id: book.user_id || '',
        prodi: book.prodi || prodiList[0] || 'D4-Manajemen Informasi Kesehatan',
        publication_type: book.publication_type || publicationTypes[0] || 'Buku Ajar',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publish_year: book.publish_year || new Date().getFullYear(),
        city: book.city || '',
        edition: book.edition || '',
        pages: book.pages || '',
        synopsis: book.synopsis || '',
        cover_file: null,
        cover_url: book.cover_image && !book.cover_image.startsWith('/storage/lecturer_books/covers/') ? book.cover_image : '',
        document_file: null,
        document_url: book.document_url && !book.document_url.startsWith('/storage/lecturer_books/docs/') ? book.document_url : '',
        doi_url: book.doi_url || '',
        hki_number: book.hki_number || '',
        is_featured: Boolean(book.is_featured),
    });

    const [coverMode, setCoverMode] = useState('file');
    const [docMode, setDocMode] = useState('file');
    const [coverPreview, setCoverPreview] = useState(book.cover_image || null);

    // SIAKAD Dosen Searchable Dropdown State
    const [dosenSearchQuery, setDosenSearchQuery] = useState('');
    const [selectedDosenNidn, setSelectedDosenNidn] = useState(book.nidn || '');
    const [dosenDropdownOpen, setDosenDropdownOpen] = useState(false);

    const filteredLecturers = useMemo(() => {
        if (!dosenSearchQuery.trim()) {
            return siakadLecturers;
        }
        const q = dosenSearchQuery.toLowerCase();
        return siakadLecturers.filter(
            (l) => (l.name && l.name.toLowerCase().includes(q)) || (l.nidn && l.nidn.toLowerCase().includes(q)) || (l.prodi && l.prodi.toLowerCase().includes(q))
        );
    }, [siakadLecturers, dosenSearchQuery]);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_file', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('document_file', file);
        }
    };

    const handleSelectSiakadDosen = (lecturer) => {
        setSelectedDosenNidn(lecturer.nidn);
        setDosenDropdownOpen(false);
        setDosenSearchQuery('');

        setData((prev) => {
            let matchedProdi = prev.prodi;
            if (lecturer.prodi) {
                const foundProdi = prodiList.find(
                    (p) => p.toLowerCase() === lecturer.prodi.toLowerCase() || p.toLowerCase().includes(lecturer.prodi.toLowerCase()) || lecturer.prodi.toLowerCase().includes(p.toLowerCase())
                );
                if (foundProdi) matchedProdi = foundProdi;
            }

            return {
                ...prev,
                authors: lecturer.name,
                nidn: lecturer.nidn,
                prodi: matchedProdi,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        router.post(`/petugas/lecturer-books/${book.id}`, {
            _method: 'PUT',
            ...data,
        }, {
            forceFormData: true,
        });
    };

    return (
        <PetugasLayout activeMenu="lecturer-books">
            <Head title={`Edit Karya: ${book.title} - SIMPUS Petugas`} />

            <form onSubmit={handleSubmit} className="space-y-8 w-full">
                {/* Header Navigation Bar */}
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
                                <span>Edit Karya Akademik Dosen</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                                Edit Data Karya Buku
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/petugas/lecturer-books/${book.id}`}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-1.5"
                        >
                            <Eye className="w-4 h-4 text-slate-500" />
                            <span>Lihat Detail</span>
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Menyimpan...' : 'Perbarui Data Karya'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Core Publication Details */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Main Title & Authors Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-sm space-y-6">
                            <h2 className="font-black text-base text-slate-950 flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-amber-600" />
                                <span>Informasi Utama Buku</span>
                            </h2>

                            {/* Judul Buku */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 mb-2">
                                    Judul Buku / Karya Akademik <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    required
                                />
                                {errors.title && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title}</p>}
                            </div>

                            {/* SIAKAD API Live Dosen Selector */}
                            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-amber-950 flex items-center space-x-1.5">
                                        <Sparkles className="w-4 h-4 text-amber-600" />
                                        <span>Tarik Data Dosen dari API SIAKAD</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                                        {siakadLecturers.length} Dosen Terhubung
                                    </span>
                                </div>

                                <div className="relative">
                                    {/* Dropdown Toggle Button */}
                                    <div
                                        onClick={() => setDosenDropdownOpen(!dosenDropdownOpen)}
                                        className="w-full py-2.5 px-3.5 bg-white border border-amber-300/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500 transition-all shadow-xs"
                                    >
                                        <span className={selectedDosenNidn ? 'text-slate-950 font-black' : 'text-slate-500 font-normal'}>
                                            {selectedDosenNidn
                                                ? siakadLecturers.find((d) => d.nidn === selectedDosenNidn)?.label || `Dosen Terpilih (NIDN: ${selectedDosenNidn})`
                                                : '-- Klik untuk memilih Nama Dosen - NIDN dari SIAKAD --'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dosenDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* Dropdown Menu with Live Search */}
                                    {dosenDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-amber-200 rounded-2xl shadow-xl z-50 p-2 space-y-2 max-h-72 flex flex-col">
                                            <div className="relative">
                                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={dosenSearchQuery}
                                                    onChange={(e) => setDosenSearchQuery(e.target.value)}
                                                    placeholder="Ketik nama dosen atau NIDN..."
                                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                                                {filteredLecturers.length > 0 ? (
                                                    filteredLecturers.map((lec) => (
                                                        <button
                                                            key={lec.nidn}
                                                            type="button"
                                                            onClick={() => handleSelectSiakadDosen(lec)}
                                                            className="w-full text-left p-2.5 hover:bg-amber-50 rounded-xl transition-colors flex items-center justify-between group"
                                                        >
                                                            <div className="space-y-0.5">
                                                                <p className="font-black text-xs text-slate-900 group-hover:text-amber-800">
                                                                    {lec.name} - <span className="font-mono text-slate-500">{lec.nidn}</span>
                                                                </p>
                                                                {lec.prodi && (
                                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                                        Homebase: {lec.prodi}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {selectedDosenNidn === lec.nidn && (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-xs text-slate-400">
                                                        Tidak ada dosen SIAKAD yang cocok dengan pencarian.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Authors & NIDN Input */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-8 space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        Nama Dosen Penulis / Tim Penulis <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.authors}
                                        onChange={(e) => setData('authors', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                    {errors.authors && <p className="text-rose-500 text-xs mt-1">{errors.authors}</p>}
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        NIDN Penulis Utama
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nidn}
                                        onChange={(e) => setData('nidn', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Program Studi & Jenis Publikasi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        Program Studi Homebase <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.prodi}
                                        onChange={(e) => setData('prodi', e.target.value)}
                                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    >
                                        {prodiList.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        Jenis Karya / Publikasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.publication_type}
                                        onChange={(e) => setData('publication_type', e.target.value)}
                                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    >
                                        {publicationTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Publishing Metadata Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-sm space-y-6">
                            <h2 className="font-black text-base text-slate-950 flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-amber-600" />
                                <span>Detail Penerbitan & Identitas Buku</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">ISBN / e-ISBN</label>
                                    <input
                                        type="text"
                                        value={data.isbn}
                                        onChange={(e) => setData('isbn', e.target.value)}
                                        placeholder="978-623-01-xxxx-x"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">Nama Penerbit</label>
                                    <input
                                        type="text"
                                        value={data.publisher}
                                        onChange={(e) => setData('publisher', e.target.value)}
                                        placeholder="Penerbit Buku..."
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">Kota Terbit</label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Surakarta / Yogyakarta"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">Tahun Terbit</label>
                                    <input
                                        type="number"
                                        value={data.publish_year}
                                        onChange={(e) => setData('publish_year', e.target.value)}
                                        min="1980"
                                        max="2099"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">Edisi / Cetakan</label>
                                    <input
                                        type="text"
                                        value={data.edition}
                                        onChange={(e) => setData('edition', e.target.value)}
                                        placeholder="Cetakan Ke-1 / Revisi"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">Jumlah Halaman</label>
                                    <input
                                        type="number"
                                        value={data.pages}
                                        onChange={(e) => setData('pages', e.target.value)}
                                        placeholder="Contoh: 250"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Synopsis */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    Sinopsis / Abstrak Ringkas Buku
                                </label>
                                <textarea
                                    rows="4"
                                    value={data.synopsis}
                                    onChange={(e) => setData('synopsis', e.target.value)}
                                    placeholder="Tuliskan ringkasan isi buku ajar, ruang lingkup pembahasan, atau capaian pembelajaran..."
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Legalitas, File & Media Upload */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* 1. Cover Image Card */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-4">
                            <h2 className="font-black text-sm text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Sampul Buku (Cover)</span>
                                <Image className="w-4 h-4 text-amber-600" />
                            </h2>

                            {/* Cover Preview Box */}
                            <div className="w-full h-52 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden relative flex items-center justify-center">
                                {coverPreview || data.cover_url ? (
                                    <img
                                        src={coverPreview || data.cover_url}
                                        alt="Preview Sampul"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-4 space-y-2">
                                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                                        <p className="text-xs text-slate-500 font-medium">Unggah gambar sampul buku</p>
                                        <p className="text-[10px] text-slate-400">Rasio 3:4 atau format potret standar buku</p>
                                    </div>
                                )}
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setCoverMode('file')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        coverMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                    }`}
                                >
                                    Unggah File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCoverMode('url')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        coverMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                    }`}
                                >
                                    Tautan URL
                                </button>
                            </div>

                            {coverMode === 'file' ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                                />
                            ) : (
                                <input
                                    type="url"
                                    value={data.cover_url}
                                    onChange={(e) => setData('cover_url', e.target.value)}
                                    placeholder="https://... URL gambar sampul"
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            )}
                            {errors.cover_file && <p className="text-rose-500 text-xs">{errors.cover_file}</p>}
                        </div>

                        {/* 2. Legalitas & Link Luar Card */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-4">
                            <h2 className="font-black text-sm text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Legalitas & Tautan Riset</span>
                                <Award className="w-4 h-4 text-emerald-600" />
                            </h2>

                            {/* Nomor HKI */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Nomor Hak Cipta / HKI (Kemenkumham)
                                </label>
                                <input
                                    type="text"
                                    value={data.hki_number}
                                    onChange={(e) => setData('hki_number', e.target.value)}
                                    placeholder="Contoh: EC00202412345"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* DOI / Sinta URL */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Tautan DOI / SINTA / Repositori
                                </label>
                                <input
                                    type="url"
                                    value={data.doi_url}
                                    onChange={(e) => setData('doi_url', e.target.value)}
                                    placeholder="https://doi.org/... atau link SINTA"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Dokumen Digital PDF */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-800">
                                        File PDF / Dokumen Digital
                                    </label>
                                    {book.document_url && (
                                        <a
                                            href={book.document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-amber-700 font-bold hover:underline"
                                        >
                                            Lihat File Saat Ini
                                        </a>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setDocMode('file')}
                                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                                            docMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                        }`}
                                    >
                                        Upload PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDocMode('url')}
                                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                                            docMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                        }`}
                                    >
                                        Link Dokumen
                                    </button>
                                </div>

                                {docMode === 'file' ? (
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.epub"
                                        onChange={handleDocChange}
                                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-amber-400 hover:file:bg-slate-800 cursor-pointer"
                                    />
                                ) : (
                                    <input
                                        type="url"
                                        value={data.document_url}
                                        onChange={(e) => setData('document_url', e.target.value)}
                                        placeholder="https://... link Google Drive/Cloud"
                                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                )}
                                {errors.document_file && <p className="text-rose-500 text-xs">{errors.document_file}</p>}
                            </div>

                            {/* Featured Highlight Toggle */}
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between mt-3">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-purple-900 block flex items-center space-x-1.5">
                                        <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                                        <span>Karya Unggulan Dosen</span>
                                    </span>
                                    <span className="text-[10px] text-purple-700">Sorot karya di dashboard dan rekapitulasi.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </PetugasLayout>
    );
}
