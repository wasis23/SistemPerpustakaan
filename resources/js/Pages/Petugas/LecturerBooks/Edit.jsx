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
    ChevronDown,
    UserCheck,
    X,
    Plus,
    Trash2,
    Users,
    User
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

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_file', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleDocChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('document_file', file);
        }
    };

    // Parse initial authors list from book.authors
    const initialAuthorsList = useMemo(() => {
        if (!book.authors) {
            return [{ name: '', nidn: book.nidn || '' }];
        }
        const parts = book.authors.split(/[,;]/).map((a) => a.trim()).filter(Boolean);
        if (parts.length === 0) {
            return [{ name: '', nidn: book.nidn || '' }];
        }
        return parts.map((name, idx) => ({
            name,
            nidn: idx === 0 ? (book.nidn || '') : '',
        }));
    }, [book]);

    // Multi-Author Dynamic List State
    const [authorsList, setAuthorsList] = useState(initialAuthorsList);
    const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
    const [dosenSearchQuery, setDosenSearchQuery] = useState('');

    const filteredLecturers = useMemo(() => {
        if (!dosenSearchQuery.trim()) {
            return siakadLecturers;
        }
        const q = dosenSearchQuery.toLowerCase();
        return siakadLecturers.filter(
            (l) => (l.name && l.name.toLowerCase().includes(q)) || (l.nidn && l.nidn.toLowerCase().includes(q)) || (l.prodi && l.prodi.toLowerCase().includes(q))
        );
    }, [siakadLecturers, dosenSearchQuery]);

    // Helper: Sinkronkan list authors ke form data
    const syncAuthorsToForm = (list) => {
        const combinedAuthors = list
            .map((a) => (a.name || '').trim())
            .filter(Boolean)
            .join('; ');
        
        setData((prev) => ({
            ...prev,
            authors: combinedAuthors,
            nidn: list[0]?.nidn || prev.nidn || '',
        }));
    };

    const handleUpdateAuthor = (index, field, value) => {
        const nextList = [...authorsList];
        nextList[index] = { ...nextList[index], [field]: value };
        setAuthorsList(nextList);
        syncAuthorsToForm(nextList);
    };

    const handleAddAuthor = () => {
        const nextList = [...authorsList, { name: '', nidn: '' }];
        setAuthorsList(nextList);
        syncAuthorsToForm(nextList);
    };

    const handleRemoveAuthor = (index) => {
        if (authorsList.length <= 1) return;
        const nextList = authorsList.filter((_, i) => i !== index);
        setAuthorsList(nextList);
        syncAuthorsToForm(nextList);
    };

    const handleSelectSiakadDosenForAuthor = (index, lecturer) => {
        const nextList = [...authorsList];
        nextList[index] = {
            ...nextList[index],
            name: lecturer.name,
            nidn: lecturer.nidn || '',
        };
        setAuthorsList(nextList);
        setActiveDropdownIndex(null);
        setDosenSearchQuery('');

        // Jika ini Penulis Utama (index 0), otomatis cocokkan Prodi Homebase
        if (index === 0 && lecturer.prodi) {
            const foundProdi = prodiList.find(
                (p) => p.toLowerCase() === lecturer.prodi.toLowerCase() || p.toLowerCase().includes(lecturer.prodi.toLowerCase()) || lecturer.prodi.toLowerCase().includes(p.toLowerCase())
            );
            if (foundProdi) {
                setData((prev) => ({
                    ...prev,
                    prodi: foundProdi,
                }));
            }
        }

        syncAuthorsToForm(nextList);
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
            <Head title={`Edit Karya: ${book.title} - Website Perpustakaan`} />

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

                            {/* Section Multi-Author (Tim Penulis Dosen) */}
                            <div className="space-y-4 pt-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                    <div>
                                        <label className="block text-xs font-extrabold text-slate-950 flex items-center space-x-1.5">
                                            <Users className="w-4 h-4 text-amber-600" />
                                            <span>Tim Penulis / Dosen <span className="text-rose-500">*</span></span>
                                        </label>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Tambahkan Penulis Utama (Penulis 1), Penulis 2, Penulis 3, dan seterusnya.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddAuthor}
                                        className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs self-start sm:self-center"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />
                                        <span>+ Tambah Penulis {authorsList.length + 1}</span>
                                    </button>
                                </div>

                                {/* List of Author Cards */}
                                <div className="space-y-3.5">
                                    {authorsList.map((author, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-2xl border transition-all ${
                                                index === 0
                                                    ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                                                    : 'bg-slate-50/70 border-slate-200/80'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        index === 0
                                                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-2xs'
                                                            : 'bg-slate-200 text-slate-800 font-bold'
                                                    }`}>
                                                        Penulis {index + 1} {index === 0 ? '(Penulis Utama)' : '(Penulis Pendamping / Co-Author)'}
                                                    </span>
                                                </div>

                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAuthor(index)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all flex items-center space-x-1 text-[11px] font-bold cursor-pointer"
                                                        title={`Hapus Penulis ${index + 1}`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Hapus</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* SIAKAD Dropdown Quick Selector per Author Row */}
                                            <div className="relative mb-3">
                                                <div
                                                    onClick={() => {
                                                        setActiveDropdownIndex(activeDropdownIndex === index ? null : index);
                                                        setDosenSearchQuery('');
                                                    }}
                                                    className="w-full py-2 px-3 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-xs text-slate-700 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                                                >
                                                    <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                        <span>
                                                            {author.nidn
                                                                ? `Dosen Terpilih: ${author.name} (NIDN: ${author.nidn})`
                                                                : `Pilih Penulis ${index + 1} dari Database Dosen SIAKAD...`}
                                                        </span>
                                                    </span>
                                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdownIndex === index ? 'rotate-180' : ''}`} />
                                                </div>

                                                {/* Search Dropdown Popup */}
                                                {activeDropdownIndex === index && (
                                                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-amber-200 rounded-2xl shadow-xl z-50 p-2.5 space-y-2 max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                                        <div className="relative">
                                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                type="text"
                                                                value={dosenSearchQuery}
                                                                onChange={(e) => setDosenSearchQuery(e.target.value)}
                                                                placeholder="Cari nama dosen atau NIDN..."
                                                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                                                                autoFocus
                                                            />
                                                        </div>

                                                        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-48">
                                                            {filteredLecturers.length > 0 ? (
                                                                filteredLecturers.map((lec) => (
                                                                    <button
                                                                        key={lec.nidn}
                                                                        type="button"
                                                                        onClick={() => handleSelectSiakadDosenForAuthor(index, lec)}
                                                                        className="w-full text-left p-2 hover:bg-amber-50 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                                                                    >
                                                                        <div>
                                                                            <p className="font-black text-xs text-slate-900 group-hover:text-amber-800">
                                                                                {lec.name}
                                                                            </p>
                                                                            <p className="text-[10px] text-slate-500 font-mono">
                                                                                NIDN: {lec.nidn || '-'} {lec.prodi ? `• ${lec.prodi}` : ''}
                                                                            </p>
                                                                        </div>
                                                                        {author.nidn === lec.nidn && (
                                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                        )}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="p-3 text-center text-xs text-slate-400">
                                                                    Tidak ada dosen SIAKAD yang cocok.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Inputs for Name & NIDN */}
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                <div className="sm:col-span-8 space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-700">
                                                        Nama Lengkap Penulis {index + 1} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={author.name}
                                                        onChange={(e) => handleUpdateAuthor(index, 'name', e.target.value)}
                                                        placeholder={`Nama Penulis ${index + 1} (beserta gelar)`}
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                        required
                                                    />
                                                </div>

                                                <div className="sm:col-span-4 space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-700">
                                                        NIDN / Identitas (Opsional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={author.nidn}
                                                        onChange={(e) => handleUpdateAuthor(index, 'nidn', e.target.value)}
                                                        placeholder="NIDN / NIP / NIK"
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Format Preview Banner */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center space-x-2 text-slate-600 font-medium">
                                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>
                                            Format tersimpan: <strong className="text-slate-900 font-bold font-mono">"{data.authors || '-'}"</strong>
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddAuthor}
                                        className="text-amber-800 hover:text-amber-950 font-bold text-[11px] flex items-center space-x-1 cursor-pointer underline self-start sm:self-center"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>+ Tambah Penulis ke-{authorsList.length + 1}</span>
                                    </button>
                                </div>
                                {errors.authors && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.authors}</p>}
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
