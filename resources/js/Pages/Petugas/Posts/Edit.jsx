import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
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
    Heading2,
    Heading3,
    Bold,
    Italic,
    Quote,
    List,
    ListOrdered,
    Link as LinkIcon,
    UploadCloud,
    ExternalLink
} from 'lucide-react';

export default function PostsEdit({ post, categories = [], authors = [] }) {
    const { data, setData, processing, errors } = useForm({
        title: post.title || '',
        slug: post.slug || '',
        category: post.category || categories[0] || 'Pengumuman',
        author_name: post.author_name || '',
        user_id: post.user_id || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        thumbnail_file: null,
        thumbnail_url: post.thumbnail && !post.thumbnail.startsWith('/storage/posts/') ? post.thumbnail : '',
        thumbnail_alt: post.thumbnail_alt || '',
        status: post.status || 'published',
        is_featured: Boolean(post.is_featured),
        published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        canonical_url: post.canonical_url || '',
    });

    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [previewTab, setPreviewTab] = useState('editor');
    const [imageUploadMode, setImageUploadMode] = useState('file');
    const [imagePreview, setImagePreview] = useState(post.thumbnail || null);

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

    const insertFormatting = (prefix, suffix = '') => {
        const textarea = document.getElementById('post-content-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end) || 'Teks disini';
        const replacement = `${prefix}${selectedText}${suffix}`;

        const newContent =
            textarea.value.substring(0, start) +
            replacement +
            textarea.value.substring(end);

        setData('content', newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length + selectedText.length
            );
        }, 50);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Laravel requires POST with _method = PUT for multipart form data
        router.post(`/petugas/posts/${post.id}`, {
            _method: 'PUT',
            ...data,
        }, {
            forceFormData: true,
        });
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
            <Head title={`Edit Berita: ${post.title} - SIMPUS Petugas`} />

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
                                <span>Edit Konten & Optimasi SEO</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                                Edit Berita & Pengumuman
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {post.status === 'published' && (
                            <Link
                                href={`/berita/${post.slug}`}
                                target="_blank"
                                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-1.5"
                            >
                                <Globe className="w-4 h-4 text-slate-500" />
                                <span>Lihat Halaman Publik</span>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </Link>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Menyimpan...' : 'Perbarui Artikel'}</span>
                        </button>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Main Content Column (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Article Title & Slug Card */}
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-5">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 mb-2">
                                    Judul Berita / Artikel <span className="text-rose-500">*</span>
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
                                        {isCustomSlug ? 'Kunci Slug' : 'Edit Slug Kustom'}
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
                                        <span className="font-bold text-amber-700 px-1">{data.slug}</span>
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

                        {/* 2. Rich Content Editor Card */}
                        <div className="bg-white rounded-3xl border border-amber-900/10 shadow-sm overflow-hidden space-y-0">
                            {/* Editor Top Toolbar */}
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<h2>', '</h2>')}
                                        title="Heading 2"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center space-x-1"
                                    >
                                        <Heading2 className="w-3.5 h-3.5" />
                                        <span>H2</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<h3>', '</h3>')}
                                        title="Heading 3"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center space-x-1"
                                    >
                                        <Heading3 className="w-3.5 h-3.5" />
                                        <span>H3</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<strong>', '</strong>')}
                                        title="Tebal (Bold)"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                                    >
                                        <Bold className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<em>', '</em>')}
                                        title="Miring (Italic)"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                                    >
                                        <Italic className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                                        title="Kutipan (Blockquote)"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                                    >
                                        <Quote className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n  <li>Poin kedua</li>\n</ul>')}
                                        title="Daftar Bullet"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n  <li>Langkah kedua</li>\n</ol>')}
                                        title="Daftar Angka"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                                    >
                                        <ListOrdered className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<a href="https://..." target="_blank">', '</a>')}
                                        title="Tautan Link"
                                        className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                                    >
                                        <LinkIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-1.5 bg-slate-200 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewTab('editor')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                            previewTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                        }`}
                                    >
                                        Editor HTML
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewTab('preview')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                            previewTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                        }`}
                                    >
                                        Pratinjau Tampilan
                                    </button>
                                </div>
                            </div>

                            {/* Editor Textarea / Preview Box */}
                            <div className="p-6">
                                {previewTab === 'editor' ? (
                                    <div>
                                        <textarea
                                            id="post-content-textarea"
                                            rows="16"
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                                            required
                                        />
                                        {errors.content && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.content}</p>}
                                    </div>
                                ) : (
                                    <div className="prose prose-slate max-w-none bg-slate-50/50 p-6 rounded-2xl border border-slate-200 min-h-[350px]">
                                        {data.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: data.content }} />
                                        ) : (
                                            <p className="text-slate-400 italic text-xs">Belum ada konten yang ditulis untuk dipratinjau.</p>
                                        )}
                                    </div>
                                )}
                            </div>
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
