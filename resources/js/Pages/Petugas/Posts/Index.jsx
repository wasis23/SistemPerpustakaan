import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import {
    Newspaper,
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    Star,
    Calendar,
    User,
    Clock,
    Globe,
    CheckCircle2,
    FileText,
    ExternalLink,
    AlertCircle,
    SlidersHorizontal,
    Sparkles
} from 'lucide-react';

export default function PostsIndex({ posts, filters = {}, categories = [], counts = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [featuredOnly, setFeaturedOnly] = useState(filters.featured_only === 'true' || filters.featured_only === true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({
            search,
            status: statusFilter,
            category: categoryFilter,
            featured_only: featuredOnly ? '1' : '',
        });
    };

    const applyFilters = (params) => {
        router.get('/petugas/posts', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            search,
            status: statusFilter,
            category: categoryFilter,
            featured_only: featuredOnly ? '1' : '',
            [key]: value,
        };
        if (key === 'status') setStatusFilter(value);
        if (key === 'category') setCategoryFilter(value);
        if (key === 'featured_only') setFeaturedOnly(value);
        applyFilters(newFilters);
    };

    const handleToggleFeatured = (post) => {
        router.post(`/petugas/posts/${post.id}/toggle-featured`, {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = (post) => {
        setPostToDelete(post);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!postToDelete) return;
        router.delete(`/petugas/posts/${postToDelete.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setPostToDelete(null);
            },
        });
    };

    return (
        <PetugasLayout activeMenu="posts">
            <Head title="Manajemen Berita & Artikel SEO - SIMPUS Petugas" />

            <div className="space-y-8 w-full">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-900 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Portal Informasi & SEO Engine</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            Manajemen Berita & Pengumuman
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
                            Publikasikan artikel, pengumuman, dan kabar literasi perpustakaan dengan optimasi SEO lengkap agar mudah terindeks mesin pencari.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/berita"
                            target="_blank"
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-2"
                        >
                            <Globe className="w-4 h-4 text-slate-500" />
                            <span>Lihat Halaman Publik</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>

                        <Link
                            href="/petugas/posts/create"
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Buat Berita Baru</span>
                        </Link>
                    </div>
                </div>

                {/* Stat Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-amber-900/10 shadow-sm space-y-1">
                        <span className="text-xs font-bold text-slate-500">Total Artikel</span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900">{counts.all || 0}</div>
                        <span className="text-[10px] text-slate-400 block font-medium">Semua konten terdaftar</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-emerald-500/20 shadow-sm space-y-1">
                        <span className="text-xs font-bold text-emerald-700">Terpublikasi</span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-600">{counts.published || 0}</div>
                        <span className="text-[10px] text-emerald-600/70 block font-medium">Tayang di halaman utama</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-1">
                        <span className="text-xs font-bold text-amber-700">Konsep (Draft)</span>
                        <div className="text-2xl sm:text-3xl font-black text-amber-600">{counts.draft || 0}</div>
                        <span className="text-[10px] text-amber-600/70 block font-medium">Belum dipublikasikan</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-purple-500/20 shadow-sm space-y-1">
                        <span className="text-xs font-bold text-purple-700">Berita Sorotan</span>
                        <div className="text-2xl sm:text-3xl font-black text-purple-600">{counts.featured || 0}</div>
                        <span className="text-[10px] text-purple-600/70 block font-medium">Unggulan di Beranda</span>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-900/10 shadow-sm space-y-4">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul artikel, topik, atau kata kunci SEO..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                            {/* Kategori Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="published">Terpublikasi</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Diarsipkan</option>
                            </select>

                            {/* Featured Filter Toggle */}
                            <button
                                type="button"
                                onClick={() => handleFilterChange('featured_only', !featuredOnly)}
                                className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all flex items-center space-x-1.5 ${
                                    featuredOnly
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-purple-600 text-purple-600' : 'text-slate-400'}`} />
                                <span>Sorotan</span>
                            </button>

                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
                            >
                                Terapkan
                            </button>
                        </div>
                    </form>
                </div>

                {/* Posts Table List */}
                <div className="bg-white rounded-3xl border border-amber-900/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                                    <th className="py-4 px-5">Artikel & Konten</th>
                                    <th className="py-4 px-4">Kategori</th>
                                    <th className="py-4 px-4">Penulis & Baca</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-center">Sorotan</th>
                                    <th className="py-4 px-4 text-center">Statistik</th>
                                    <th className="py-4 px-5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {posts.data && posts.data.length > 0 ? (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-amber-50/40 transition-colors">
                                            {/* Thumbnail & Title */}
                                            <td className="py-4 px-5 max-w-sm">
                                                <div className="flex items-start space-x-3.5">
                                                    <div className="w-16 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                        {post.thumbnail ? (
                                                            <img
                                                                src={post.thumbnail}
                                                                alt={post.thumbnail_alt || post.title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=300&q=80';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Link
                                                            href={`/petugas/posts/${post.id}/edit`}
                                                            className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 text-xs sm:text-sm block"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                                                            <span>/berita/{post.slug}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-amber-100/80 text-amber-900 font-bold rounded-lg text-[10px]">
                                                    {post.category}
                                                </span>
                                            </td>

                                            {/* Author & Reading Time */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-[11px]">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{post.author_name || (post.author?.name || 'Pustakawan')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{post.reading_time || 1} min baca</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                {post.status === 'published' && (
                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full inline-flex items-center space-x-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>Terpublikasi</span>
                                                    </span>
                                                )}
                                                {post.status === 'draft' && (
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-full inline-flex items-center space-x-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                        <span>Konsep</span>
                                                    </span>
                                                )}
                                                {post.status === 'archived' && (
                                                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full inline-flex items-center space-x-1">
                                                        <span>Arsip</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Featured Star Toggle */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleFeatured(post)}
                                                    title={post.is_featured ? 'Hapus dari sorotan utama' : 'Jadikan sorotan utama di beranda'}
                                                    className={`p-2 rounded-xl transition-all ${
                                                        post.is_featured
                                                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <Star className={`w-4 h-4 ${post.is_featured ? 'fill-purple-600' : ''}`} />
                                                </button>
                                            </td>

                                            {/* Stats (Views & Date) */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center space-x-1 font-extrabold text-slate-800 text-xs">
                                                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{post.view_count || 0}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 block font-medium">
                                                        {post.published_at
                                                            ? new Date(post.published_at).toLocaleDateString('id-ID', {
                                                                  day: 'numeric',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              })
                                                            : 'Belum terbit'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-4 px-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {post.status === 'published' && (
                                                        <Link
                                                            href={`/berita/${post.slug}`}
                                                            target="_blank"
                                                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                                                            title="Pratinjau Halaman Publik"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                    )}

                                                    <Link
                                                        href={`/petugas/posts/${post.id}/edit`}
                                                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-all"
                                                        title="Edit Berita & SEO"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(post)}
                                                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all"
                                                        title="Hapus Berita"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400 space-y-3">
                                            <Newspaper className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300" />
                                            <p className="font-bold text-sm text-slate-600">Belum ada berita atau artikel ditemukan</p>
                                            <p className="text-xs text-slate-400">
                                                Silakan buat artikel baru atau sesuaikan kata kunci pencarian Anda.
                                            </p>
                                            <div className="pt-2">
                                                <Link
                                                    href="/petugas/posts/create"
                                                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center space-x-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Tulis Berita Pertama</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500 font-medium">
                                Menampilkan {posts.from || 0} - {posts.to || 0} dari total {posts.total || 0} artikel
                            </div>

                            <div className="flex items-center space-x-1.5">
                                {posts.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 font-black'
                                                : link.url
                                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-amber-900/10">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-base text-slate-950">Hapus Berita Ini?</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Artikel <strong>"{postToDelete?.title}"</strong> akan dihapus permanen dari sistem dan tidak akan tampil lagi di halaman utama perpustakaan.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                            >
                                Ya, Hapus Artikel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
