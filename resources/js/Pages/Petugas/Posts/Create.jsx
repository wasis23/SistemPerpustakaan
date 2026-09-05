import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import RichTextEditor from '@/Components/RichTextEditor';
import {
    ArrowLeft,
    Sparkles,
    Save,
    Eye,
    Globe,
    Search,
    Image,
    Tag,
    Calendar,
    User,
    Clock,
    FileText,
    Star,
    CheckCircle2,
    AlertCircle,
    Info,
    HelpCircle,
    UploadCloud,
    ExternalLink,
    Wand2,
    Bot,
    Zap,
    Loader2,
    RefreshCw,
    SlidersHorizontal
} from 'lucide-react';

export default function PostsCreate({ categories = [], authors = [], defaultAuthor = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        category: categories[0] || 'Pengumuman',
        author_name: defaultAuthor?.name || 'Pustakawan SIMPUS',
        user_id: defaultAuthor?.id || '',
        excerpt: '',
        content: '',
        thumbnail_file: null,
        thumbnail_url: '',
        thumbnail_alt: '',
        status: 'published',
        is_featured: false,
        published_at: new Date().toISOString().slice(0, 16),
        meta_title: '',
        meta_description: '',
        meta_keywords: 'perpustakaan, simpus, poltekindonusa, buku, literasi',
        canonical_url: '',
    });

    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [imageUploadMode, setImageUploadMode] = useState('file'); // 'file' | 'url'
    const [imagePreview, setImagePreview] = useState(null);

    // AI Generator State
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiCategory, setAiCategory] = useState(categories[0] || 'Pengumuman');
    const [aiTone, setAiTone] = useState('informatif, menarik, dan profesional');
    const [showAiOptions, setShowAiOptions] = useState(false);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiSuccessMessage, setAiSuccessMessage] = useState(null);
    const [aiErrorMessage, setAiErrorMessage] = useState(null);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isCustomSlug && data.title) {
            const generated = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            setData((prev) => ({
                ...prev,
                slug: generated,
                meta_title: prev.meta_title ? prev.meta_title : prev.title,
            }));
        }
    }, [data.title, isCustomSlug]);

    // Handle AI generation
    const handleGenerateAi = async (customPrompt = null) => {
        const promptToUse = (typeof customPrompt === 'string' ? customPrompt : (aiPrompt || data.title)).trim();
        if (!promptToUse) {
            setAiErrorMessage('Silakan ketikkan judul atau ide topik berita terlebih dahulu.');
            return;
        }

        setIsGeneratingAi(true);
        setAiErrorMessage(null);
        setAiSuccessMessage(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/petugas/posts/generate-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    prompt: promptToUse,
                    category: aiCategory || data.category,
                    tone: aiTone,
                }),
            });

            const resData = await response.json();
            if (resData.success && resData.data) {
                const ai = resData.data;
                setData((prev) => ({
                    ...prev,
                    title: ai.title || prev.title,
                    slug: ai.slug || prev.slug,
                    category: ai.category || prev.category,
                    excerpt: ai.excerpt || prev.excerpt,
                    content: ai.content || prev.content,
                    meta_title: ai.meta_title || ai.title || prev.meta_title,
                    meta_description: ai.meta_description || ai.excerpt || prev.meta_description,
                    meta_keywords: ai.meta_keywords || prev.meta_keywords,
                    thumbnail_alt: ai.thumbnail_alt || prev.thumbnail_alt,
                }));
                setAiPrompt(ai.title || promptToUse);
                setAiSuccessMessage('Berita berhasil dibuat lengkap oleh AI! Semua isian (Judul, Slug, Kategori, Ringkasan, Isi Berita, dan SEO) telah terisi otomatis.');
            } else {
                setAiErrorMessage('Gagal membuat konten dengan AI. Silakan coba kembali.');
            }
        } catch (err) {
            setAiErrorMessage('Terjadi kendala jaringan saat menghubungi asisten AI.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    // Handle Image file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail_file', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/petugas/posts');
    };

    // Calculate SEO score indicators
    const metaTitleLength = (data.meta_title || data.title || '').length;
    const metaDescLength = (data.meta_description || data.excerpt || '').length;

    const getTitleScoreColor = () => {
        if (metaTitleLength >= 40 && metaTitleLength <= 65) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (metaTitleLength > 0 && metaTitleLength < 40) return 'text-amber-600 bg-amber-50 border-amber-200';
        if (metaTitleLength > 65) return 'text-rose-600 bg-rose-50 border-rose-200';
        return 'text-slate-400 bg-slate-50 border-slate-200';
    };

    const getDescScoreColor = () => {
        if (metaDescLength >= 120 && metaDescLength <= 160) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (metaDescLength > 0 && metaDescLength < 120) return 'text-amber-600 bg-amber-50 border-amber-200';
        if (metaDescLength > 160) return 'text-rose-600 bg-rose-50 border-rose-200';
        return 'text-slate-400 bg-slate-50 border-slate-200';
    };

    return (
        <PetugasLayout activeMenu="posts">
            <Head title="Buat Berita & Artikel SEO - SIMPUS Petugas" />

            <form onSubmit={handleSubmit} className="space-y-8 w-full">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/petugas/posts"
                            className="p-2.5 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 text-slate-700 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>SEO-Optimized Content Writer</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                                Tulis Berita & Pengumuman Baru
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setData('status', 'draft');
                                setTimeout(() => {
                                    document.getElementById('submit-btn')?.click();
                                }, 50);
                            }}
                            disabled={processing}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all"
                        >
                            Simpan Draft
                        </button>

                        <button
                            id="submit-btn"
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Menyimpan...' : 'Publikasikan Artikel'}</span>
                        </button>
                    </div>
                </div>

                {/* AI Assistant Widget Banner */}
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 p-6 rounded-3xl border border-amber-500/30 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-sm font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                                        <span>Asisten Penulis Berita AI (LLM Automatic Generator)</span>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                                            Auto-Fill
                                        </span>
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Cukup ketikkan judul atau ide topik, AI akan otomatis membuat judul berita, ringkasan, isi berita berformat lengkap, dan optimasi SEO.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAiOptions(!showAiOptions)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto transition-all"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <span>{showAiOptions ? 'Tutup Opsi AI' : 'Opsi Gaya Bahasa & Kategori'}</span>
                        </button>
                    </div>

                    {/* AI Prompt Input Bar */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleGenerateAi();
                                        }
                                    }}
                                    placeholder="Ketik ide/topik berita, contoh: Sosialisasi Akses Database Jurnal ScienceDirect & IEEE untuk Skripsi..."
                                    className="w-full pl-4 pr-10 py-3 bg-white border border-amber-900/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
                                />
                                {aiPrompt && (
                                    <button
                                        type="button"
                                        onClick={() => setAiPrompt('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleGenerateAi()}
                                disabled={isGeneratingAi || (!aiPrompt && !data.title)}
                                className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
                            >
                                {isGeneratingAi ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                        <span>Sedang Menulis Berita...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        <span>Generate Berita Lengkap AI</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Collapsible Advanced AI Options */}
                        {showAiOptions && (
                            <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-800 mb-1">
                                        Kategori Berita Target
                                    </label>
                                    <select
                                        value={aiCategory}
                                        onChange={(e) => setAiCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-800 mb-1">
                                        Gaya Bahasa / Tone Tulisan
                                    </label>
                                    <select
                                        value={aiTone}
                                        onChange={(e) => setAiTone(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                        <option value="informatif, menarik, dan profesional">Informatif, Menarik & Profesional (Standar)</option>
                                        <option value="formal dan akademik">Resmi, Formal & Akademik</option>
                                        <option value="antusias, persuasif, dan mengajak">Antusias, Promotif & Mengajak Mahasiswa</option>
                                        <option value="ringkas, padat, dan langsung ke poin">Ringkas, Lugas & To-The-Point</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Success & Error Notification Badges */}
                        {aiSuccessMessage && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{aiSuccessMessage}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiSuccessMessage(null)}
                                    className="text-emerald-500 hover:text-emerald-700 font-bold ml-2"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {aiErrorMessage && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-rose-800 animate-in fade-in duration-200">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{aiErrorMessage}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiErrorMessage(null)}
                                    className="text-rose-500 hover:text-rose-700 font-bold ml-2"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Main Content Column (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Article Title & Slug Card */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-extrabold text-slate-900">
                                        Judul Berita / Artikel <span className="text-rose-500">*</span>
                                    </label>
                                    {data.title && (
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateAi(data.title)}
                                            disabled={isGeneratingAi}
                                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1"
                                            title="Generate seluruh isi artikel berdasarkan judul ini"
                                        >
                                            <Zap className="w-3 h-3 text-amber-500" />
                                            <span>Generate Form dari Judul Ini</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul berita yang menarik dan informatif..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:font-normal"
                                    required
                                />
                                {errors.title && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title}</p>}
                            </div>

                            {/* Slug Preview & Edit */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                                        <Globe className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Struktur URL / Permalink SEO:</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomSlug(!isCustomSlug)}
                                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                                    >
                                        {isCustomSlug ? 'Auto Generate' : 'Edit Slug Kustom'}
                                    </button>
                                </div>

                                <div className="flex items-center text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
                                    <span className="text-slate-400 select-none">https://perpustakaan.poltekindonusa.ac.id/berita/</span>
                                    {isCustomSlug ? (
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            className="font-bold text-slate-900 focus:outline-none flex-1 bg-transparent px-1"
                                            placeholder="slug-url-artikel"
                                        />
                                    ) : (
                                        <span className="font-bold text-amber-700 px-1">{data.slug || 'judul-berita'}</span>
                                    )}
                                </div>
                                {errors.slug && <p className="text-rose-500 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            {/* Excerpt / Summary */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-extrabold text-slate-900">
                                        Ringkasan Singkat (Excerpt / Snippet)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {data.excerpt?.length || 0}/200 karakter
                                    </span>
                                </div>
                                <textarea
                                    rows="2"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    placeholder="Tulis ringkasan 1-2 kalimat untuk kartu preview di halaman utama dan meta deskripsi search engine..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                                {errors.excerpt && <p className="text-rose-500 text-xs mt-1">{errors.excerpt}</p>}
                            </div>
                        </div>

                        {/* 2. Visual Dynamic Rich Text Editor */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    Isi Berita / Konten Artikel <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    Editor Teks Dinamis (Heading, Bold, Rata Teks, List, Link)
                                </span>
                            </div>
                            <RichTextEditor
                                value={data.content}
                                onChange={(content) => setData('content', content)}
                                placeholder="Tuliskan isi berita di sini. Anda dapat mengatur heading, menebalkan teks, miring, rata kiri, rata tengah, rata kanan, rata kanan-kiri (justify), daftar poin, dan tautan secara langsung..."
                                error={errors.content}
                            />
                        </div>

                        {/* 3. Live Google Search & Social Media SEO Snippet Preview */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-6">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                                    <Search className="w-4 h-4 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-sm text-slate-950">Pratinjau Hasil Pencarian Google (SERP Preview)</h2>
                                    <p className="text-[11px] text-slate-500">
                                        Simulasi tampilan artikel Anda ketika ditemukan oleh calon pembaca di Google Search.
                                    </p>
                                </div>
                            </div>

                            {/* Google Search Card Simulation */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm space-y-2 w-full">
                                <div className="flex items-center space-x-2 text-[11px] text-slate-700">
                                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                                        P
                                    </div>
                                    <div className="leading-tight">
                                        <div className="font-medium text-slate-900">Perpustakaan Politeknik Indonusa</div>
                                        <div className="text-[10px] text-slate-500">
                                            https://perpustakaan.poltekindonusa.ac.id › berita › {data.slug || 'slug-berita'}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                                    {data.meta_title || data.title || 'Judul Berita Perpustakaan Politeknik Indonusa Surakarta'}
                                </div>

                                <div className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                                    {data.meta_description || data.excerpt || (data.content ? data.content.replace(/<[^>]*>?/gm, '').slice(0, 155) : 'Ringkasan artikel berita dan informasi layanan perpustakaan digital Politeknik Indonusa Surakarta...')}
                                </div>
                            </div>

                            {/* SEO Inputs Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                                {/* Meta Title Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-800">
                                            Meta Title SEO
                                        </label>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTitleScoreColor()}`}>
                                            {metaTitleLength} / 60 Karakter
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        placeholder={data.title || 'Judul khusus untuk mesin pencari...'}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400">Jika dikosongkan, akan otomatis menggunakan judul artikel.</p>
                                </div>

                                {/* Meta Description Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-800">
                                            Meta Description SEO
                                        </label>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDescScoreColor()}`}>
                                            {metaDescLength} / 160 Karakter
                                        </span>
                                    </div>
                                    <textarea
                                        rows="2"
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        placeholder={data.excerpt || 'Deskripsi ringkas 150-160 karakter untuk Google...'}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>

                                {/* Focus Keywords Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-800">
                                        Kata Kunci SEO (Focus Keywords)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        placeholder="contoh: perpustakaan, buku baru, poltek, literasi"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400">Pisahkan beberapa kata kunci dengan tanda koma (,).</p>
                                </div>

                                {/* Canonical URL */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-800">
                                        Canonical URL (Opsional)
                                    </label>
                                    <input
                                        type="url"
                                        value={data.canonical_url}
                                        onChange={(e) => setData('canonical_url', e.target.value)}
                                        placeholder="https://... (Kosongkan jika bukan sindikasi)"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Column (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* 1. Publishing Configuration Card */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-5">
                            <h2 className="font-extrabold text-sm text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Pengaturan Publikasi</span>
                                <FileText className="w-4 h-4 text-amber-600" />
                            </h2>

                            {/* Status Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">Status Artikel</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                >
                                    <option value="published">Terpublikasi (Live Publik)</option>
                                    <option value="draft">Konsep (Draft Rahasia)</option>
                                    <option value="archived">Arsipkan</option>
                                </select>
                            </div>

                            {/* Featured Highlight Toggle */}
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-purple-900 block flex items-center space-x-1.5">
                                        <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                                        <span>Berita Sorotan (Featured)</span>
                                    </span>
                                    <span className="text-[10px] text-purple-700">Tampilkan di slider/banner beranda utama.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                                />
                            </div>

                            {/* Tanggal Terbit */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">Jadwal / Tanggal Publikasi</label>
                                <input
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Kategori Berita */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">Kategori Konten</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Author Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">Nama Penulis / Pustakawan</label>
                                <input
                                    type="text"
                                    value={data.author_name}
                                    onChange={(e) => setData('author_name', e.target.value)}
                                    placeholder="Nama Penulis / UPT Perpustakaan"
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* 2. Thumbnail & SEO Image Card */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-4">
                            <h2 className="font-extrabold text-sm text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Gambar Sampul (Thumbnail)</span>
                                <Image className="w-4 h-4 text-amber-600" />
                            </h2>

                            {/* Image Preview Box */}
                            <div className="w-full h-44 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden relative flex items-center justify-center">
                                {imagePreview || data.thumbnail_url ? (
                                    <img
                                        src={imagePreview || data.thumbnail_url}
                                        alt="Preview Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-4 space-y-2">
                                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                                        <p className="text-xs text-slate-500 font-medium">Unggah gambar sampul artikel</p>
                                        <p className="text-[10px] text-slate-400">Rekomendasi rasio 16:9 (1200 x 675 px)</p>
                                    </div>
                                )}
                            </div>

                            {/* Upload Choice Switch */}
                            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setImageUploadMode('file')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        imageUploadMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                    }`}
                                >
                                    Unggah File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageUploadMode('url')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        imageUploadMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                    }`}
                                >
                                    Tautan URL
                                </button>
                            </div>

                            {imageUploadMode === 'file' ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                                />
                            ) : (
                                <input
                                    type="url"
                                    value={data.thumbnail_url}
                                    onChange={(e) => setData('thumbnail_url', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            )}
                            {errors.thumbnail_file && <p className="text-rose-500 text-xs">{errors.thumbnail_file}</p>}

                            {/* Image Alt Text (SEO Crucial) */}
                            <div className="space-y-1 pt-1">
                                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                    <span>Alt Text Gambar (SEO Image)</span>
                                    <span className="text-[10px] text-emerald-600 font-medium">Sangat Penting</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.thumbnail_alt}
                                    onChange={(e) => setData('thumbnail_alt', e.target.value)}
                                    placeholder="Deskripsi gambar untuk Google Images..."
                                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </PetugasLayout>
    );
}
