import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ArrowLeft,
    Calendar,
    User,
    Clock,
    Eye,
    Share2,
    Check,
    Tag,
    ChevronRight,
    Sparkles,
    Bookmark,
    ArrowRight,
    MessageCircle,
    Monitor
} from 'lucide-react';

export default function BeritaShow({ post, relatedPosts = [], popularPosts = [], appUrl = '' }) {
    const { auth } = usePage().props;
    const [copied, setCopied] = useState(false);

    const fullUrl = typeof window !== 'undefined' ? window.location.href : `${appUrl}/berita/${post.slug}`;
    const seoTitle = post.meta_title || `${post.title} - Perpustakaan Politeknik Indonusa`;
    const seoDescription = post.meta_description || post.excerpt || post.title;
    const seoImage = post.thumbnail || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80';

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // JSON-LD Structured Data Schema for Google (NewsArticle / BlogPosting)
    const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': post.title,
        'image': [seoImage],
        'datePublished': post.published_at || post.created_at,
        'dateModified': post.updated_at || post.created_at,
        'author': [{
            '@type': 'Person',
            'name': post.author_name || 'Pustakawan Politeknik Indonusa',
        }],
        'publisher': {
            '@type': 'Organization',
            'name': 'Perpustakaan Politeknik Indonusa Surakarta',
            'logo': {
                '@type': 'ImageObject',
                'url': `${appUrl}/logo.png`,
            }
        },
        'description': seoDescription,
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': fullUrl,
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950">
            {/* Meta SEO & Open Graph Tags */}
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
                {post.canonical_url && <link rel="canonical" href={post.canonical_url} />}

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={seoImage} />
                <meta property="og:url" content={fullUrl} />
                <meta property="og:site_name" content="SIMPUS Politeknik Indonusa Surakarta" />
                {post.published_at && <meta property="article:published_time" content={post.published_at} />}
                <meta property="article:section" content={post.category} />

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={seoImage} />

                {/* Structured Data JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Head>

            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-all">
                            <BookOpen className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                                SIMPUS<span className="text-amber-600">.</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                                Politeknik Indonusa Surakarta
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
                        <Link href="/" className="hover:text-amber-600 transition-colors">
                            Beranda
                        </Link>
                        <Link href="/katalog" className="hover:text-amber-600 transition-colors">
                            Katalog Buku
                        </Link>
                        <Link href="/berita" className="text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5">
                            Berita & Pengumuman
                        </Link>
                        <Link href="/presensi" target="_blank" className="hover:text-amber-600 transition-colors flex items-center space-x-1">
                            <Monitor className="w-4 h-4 text-amber-500" />
                            <span>Presensi</span>
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-3">
                        {auth && auth.user ? (
                            <Link
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-full shadow-lg transition-all flex items-center space-x-2 border border-slate-700"
                            >
                                <span>Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                            >
                                <span>Portal Anggota</span>
                                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Breadcrumb Bar */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 text-xs font-semibold text-slate-600">
                    <Link href="/" className="hover:text-amber-800">Beranda</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <Link href="/berita" className="hover:text-amber-800">Berita</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-amber-800 truncate max-w-xs">{post.category}</span>
                </div>
            </div>

            {/* Main Article Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Main Article Column (8 cols) */}
                    <main className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-amber-900/10 shadow-sm space-y-8">
                        {/* Article Header Metadata */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 bg-amber-500/15 text-amber-900 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                <span>{post.category}</span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-4 border-b border-slate-100 text-xs text-slate-500 font-medium">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center space-x-2 text-slate-800 font-bold">
                                        <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                                            {(post.author_name || 'P')[0]}
                                        </div>
                                        <span>{post.author_name || 'Pustakawan SIMPUS'}</span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                            {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{post.reading_time || 2} menit baca</span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{post.view_count || 1} dibaca</span>
                                    </div>
                                </div>

                                {/* Social Share Buttons */}
                                <div className="flex items-center space-x-2">
                                    <a
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + fullUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all font-bold text-xs flex items-center space-x-1"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>WhatsApp</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold text-xs flex items-center space-x-1"
                                        title="Salin Tautan Artikel"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                                        <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Featured Thumbnail */}
                        {post.thumbnail && (
                            <div className="rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm max-h-[460px]">
                                <img
                                    src={post.thumbnail}
                                    alt={post.thumbnail_alt || post.title}
                                    className="w-full h-full object-cover"
                                />
                                {post.thumbnail_alt && (
                                    <p className="text-[11px] text-slate-400 p-2 text-center italic bg-slate-50 border-t border-slate-100">
                                        {post.thumbnail_alt}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Excerpt Lead Paragraph */}
                        {post.excerpt && (
                            <div className="p-5 bg-amber-500/10 rounded-2xl border-l-4 border-amber-500 text-slate-800 text-sm sm:text-base font-semibold leading-relaxed">
                                {post.excerpt}
                            </div>
                        )}

                        {/* Rich HTML Content */}
                        <div
                            className="prose prose-slate sm:prose-base max-w-none text-slate-800 leading-relaxed space-y-4"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Keyword Tags */}
                        {post.meta_keywords && (
                            <div className="pt-6 border-t border-slate-100 space-y-2">
                                <span className="text-xs font-bold text-slate-500 block">Kata Kunci Terkait:</span>
                                <div className="flex flex-wrap gap-2">
                                    {post.meta_keywords.split(',').map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                                        >
                                            #{kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Right Sidebar Column (4 cols) */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Related Articles Card */}
                        {relatedPosts && relatedPosts.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm space-y-4">
                                <h3 className="font-black text-sm text-slate-950 flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    <span>Berita Terkait Lainnya</span>
                                </h3>

                                <div className="space-y-4">
                                    {relatedPosts.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/berita/${item.slug}`}
                                            className="group flex items-start space-x-3.5 p-2 rounded-2xl hover:bg-amber-50/60 transition-all"
                                        >
                                            <div className="w-16 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                <img
                                                    src={item.thumbnail || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=200&q=80'}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 block font-medium">
                                                    {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular News Card */}
                        {popularPosts && popularPosts.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm space-y-4">
                                <h3 className="font-black text-sm text-slate-950 flex items-center space-x-2">
                                    <Eye className="w-4 h-4 text-amber-500" />
                                    <span>Berita Terpopuler</span>
                                </h3>

                                <div className="space-y-3">
                                    {popularPosts.map((pop, idx) => (
                                        <Link
                                            key={pop.id}
                                            href={`/berita/${pop.slug}`}
                                            className="group flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-all"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-500 font-black text-xs flex items-center justify-center shrink-0 transition-colors">
                                                {idx + 1}
                                            </span>
                                            <h4 className="font-bold text-xs text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                {pop.title}
                                            </h4>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Back to All News Button */}
                        <Link
                            href="/berita"
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Semua Berita</span>
                        </Link>
                    </aside>
                </div>
            </div>

            {/* Public Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                            <BookOpen className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="font-extrabold text-white text-base">SIMPUS Politeknik Indonusa Surakarta</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Sistem Informasi Manajemen Perpustakaan Digital Berbasis Self-Service & Optimasi Akses Literasi Ilmiah.
                    </p>
                    <p className="text-[11px] text-slate-600">
                        &copy; {new Date().getFullYear()} Politeknik Indonusa Surakarta. Hak Cipta Dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
