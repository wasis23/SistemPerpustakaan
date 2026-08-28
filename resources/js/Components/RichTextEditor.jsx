import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Link2Off,
    Minus,
    RemoveFormatting,
    Undo2,
    Redo2,
    Eye,
    Code,
    Sparkles,
    Check,
    X,
    FileText
} from 'lucide-react';

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Tuliskan isi berita lengkap di sini secara visual dan dinamis...',
    error = null,
    minHeight = '360px'
}) {
    const editorRef = useRef(null);
    const [mode, setMode] = useState('visual'); // 'visual' | 'code' | 'preview'
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        justifyFull: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        heading: 'p'
    });

    // Link modal state
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [savedSelection, setSavedSelection] = useState(null);

    // Initial and external value sync to contentEditable element
    useEffect(() => {
        if (typeof document === 'undefined' || !editorRef.current || mode !== 'visual') return;

        const stringValue = typeof value === 'string' ? value : '';
        if (editorRef.current.innerHTML !== stringValue) {
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = stringValue;
            }
        }
    }, [value, mode]);

    // Update active format states safely
    const updateActiveFormats = useCallback(() => {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        if (mode !== 'visual' || !editorRef.current) return;

        try {
            const isBold = Boolean(document.queryCommandState && document.queryCommandState('bold'));
            const isItalic = Boolean(document.queryCommandState && document.queryCommandState('italic'));
            const isUnderline = Boolean(document.queryCommandState && document.queryCommandState('underline'));
            const isStrike = Boolean(document.queryCommandState && document.queryCommandState('strikeThrough'));
            const isLeft = Boolean(document.queryCommandState && document.queryCommandState('justifyLeft'));
            const isCenter = Boolean(document.queryCommandState && document.queryCommandState('justifyCenter'));
            const isRight = Boolean(document.queryCommandState && document.queryCommandState('justifyRight'));
            const isJustify = Boolean(document.queryCommandState && document.queryCommandState('justifyFull'));
            const isUnordered = Boolean(document.queryCommandState && document.queryCommandState('insertUnorderedList'));
            const isOrdered = Boolean(document.queryCommandState && document.queryCommandState('insertOrderedList'));

            // Detect heading / block type
            let currentHeading = 'p';
            const selection = window.getSelection ? window.getSelection() : null;
            if (selection && selection.rangeCount > 0) {
                let node = selection.anchorNode;
                while (node && node !== editorRef.current) {
                    if (node.nodeType === 1) {
                        const tag = node.tagName.toLowerCase();
                        if (['h1', 'h2', 'h3', 'h4', 'blockquote', 'p'].includes(tag)) {
                            currentHeading = tag;
                            break;
                        }
                    }
                    node = node.parentNode;
                }
            }

            setActiveFormats({
                bold: isBold,
                italic: isItalic,
                underline: isUnderline,
                strikeThrough: isStrike,
                justifyLeft: isLeft,
                justifyCenter: isCenter,
                justifyRight: isRight,
                justifyFull: isJustify,
                insertUnorderedList: isUnordered,
                insertOrderedList: isOrdered,
                heading: currentHeading
            });
        } catch (e) {
            // Ignore edge-case browser command state errors
        }
    }, [mode]);

    // Handle user typing in visual editor
    const handleInput = () => {
        if (typeof document === 'undefined' || !editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const cleanContent = (html === '<p><br></p>' || html === '<br>' || html === '<p></p>') ? '' : html;
        if (onChange) {
            onChange(cleanContent);
        }
        updateActiveFormats();
    };

    // Execute standard formatting commands
    const executeCommand = (command, val = null) => {
        if (typeof document === 'undefined' || mode !== 'visual') return;
        if (editorRef.current) {
            editorRef.current.focus();
        }
        try {
            document.execCommand(command, false, val);
        } catch (e) {}
        handleInput();
    };

    // Format heading
    const handleHeadingChange = (tag) => {
        if (typeof document === 'undefined' || mode !== 'visual') return;
        if (editorRef.current) {
            editorRef.current.focus();
        }
        try {
            if (tag === 'p') {
                document.execCommand('formatBlock', false, '<p>');
            } else {
                document.execCommand('formatBlock', false, `<${tag}>`);
            }
        } catch (e) {}
        handleInput();
    };

    // Save selection before opening link modal
    const openLinkModal = () => {
        if (typeof window === 'undefined') return;
        const sel = window.getSelection ? window.getSelection() : null;
        if (sel && sel.rangeCount > 0) {
            setSavedSelection(sel.getRangeAt(0).cloneRange());
            const text = sel.toString();
            setLinkText(text);
            setLinkUrl('');
            setShowLinkModal(true);
        } else {
            setLinkText('');
            setLinkUrl('');
            setShowLinkModal(true);
        }
    };

    // Apply link
    const applyLink = (e) => {
        e?.preventDefault();
        if (!linkUrl) return;

        if (editorRef.current) {
            editorRef.current.focus();
        }

        if (savedSelection && typeof window !== 'undefined') {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedSelection);
            }
        }

        let formattedUrl = linkUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('#') && !formattedUrl.startsWith('mailto:')) {
            formattedUrl = 'https://' + formattedUrl;
        }

        try {
            if (linkText && (!savedSelection || savedSelection.collapsed)) {
                const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-amber-600 underline hover:text-amber-800">${linkText}</a>`;
                document.execCommand('insertHTML', false, linkHtml);
            } else {
                document.execCommand('createLink', false, formattedUrl);
            }
        } catch (err) {}

        handleInput();
        setShowLinkModal(false);
        setSavedSelection(null);
        setLinkUrl('');
        setLinkText('');
    };

    // Unlink
    const removeLink = () => {
        executeCommand('unlink');
    };

    // Word and character count calculation without DOM mutation
    const stringValue = typeof value === 'string' ? value : '';
    const plainText = stringValue.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    const charCount = plainText.length;
    const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const isEmpty = !stringValue || stringValue === '<p><br></p>' || stringValue === '<br>' || stringValue.trim() === '';

    return (
        <div className="rounded-3xl border border-amber-900/10 shadow-sm bg-white overflow-hidden flex flex-col">
            {/* Header & Main Toolbar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                {/* Formatting Tools Group */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Headings Selector */}
                    <div className="relative">
                        <select
                            disabled={mode !== 'visual'}
                            value={activeFormats.heading}
                            onChange={(e) => handleHeadingChange(e.target.value)}
                            className="text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50 cursor-pointer shadow-xs"
                            title="Format Teks / Judul"
                        >
                            <option value="p">Normal / Paragraf</option>
                            <option value="h1">Heading 1 (Judul Utama)</option>
                            <option value="h2">Heading 2 (Sub Judul)</option>
                            <option value="h3">Heading 3 (Topik Bahasan)</option>
                            <option value="h4">Heading 4 (Sub Topik)</option>
                            <option value="blockquote">Kutipan (Blockquote)</option>
                        </select>
                    </div>

                    <div className="w-px h-5 bg-slate-300 mx-1"></div>

                    {/* Font Styling Buttons (Bold, Italic, Underline, Strikethrough) */}
                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('bold')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.bold
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Tebal (Bold) - Ctrl+B"
                    >
                        <Bold className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('italic')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.italic
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Miring (Italic) - Ctrl+I"
                    >
                        <Italic className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('underline')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.underline
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Garis Bawah (Underline) - Ctrl+U"
                    >
                        <Underline className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('strikeThrough')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.strikeThrough
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Coret Teks (Strikethrough)"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-slate-300 mx-1"></div>

                    {/* Text Alignment Controls */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
                        <button
                            type="button"
                            disabled={mode !== 'visual'}
                            onClick={() => executeCommand('justifyLeft')}
                            className={`p-1.5 rounded-lg transition-all ${
                                activeFormats.justifyLeft
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                            }`}
                            title="Rata Kiri (Align Left)"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            disabled={mode !== 'visual'}
                            onClick={() => executeCommand('justifyCenter')}
                            className={`p-1.5 rounded-lg transition-all ${
                                activeFormats.justifyCenter
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                            }`}
                            title="Rata Tengah (Align Center)"
                        >
                            <AlignCenter className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            disabled={mode !== 'visual'}
                            onClick={() => executeCommand('justifyRight')}
                            className={`p-1.5 rounded-lg transition-all ${
                                activeFormats.justifyRight
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                            }`}
                            title="Rata Kanan (Align Right)"
                        >
                            <AlignRight className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            disabled={mode !== 'visual'}
                            onClick={() => executeCommand('justifyFull')}
                            className={`p-1.5 rounded-lg transition-all ${
                                activeFormats.justifyFull
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                            }`}
                            title="Rata Kanan Kiri / Justify"
                        >
                            <AlignJustify className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="w-px h-5 bg-slate-300 mx-1"></div>

                    {/* Lists & Quotes */}
                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('insertUnorderedList')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.insertUnorderedList
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Daftar Poin (Bullet List)"
                    >
                        <List className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('insertOrderedList')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.insertOrderedList
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Daftar Angka (Numbered List)"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => handleHeadingChange(activeFormats.heading === 'blockquote' ? 'p' : 'blockquote')}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                            activeFormats.heading === 'blockquote'
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                        }`}
                        title="Kutipan Khusus (Blockquote)"
                    >
                        <Quote className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-slate-300 mx-1"></div>

                    {/* Link Tools */}
                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={openLinkModal}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs transition-all disabled:opacity-50 shadow-xs"
                        title="Sisipkan Tautan Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={removeLink}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs transition-all disabled:opacity-50 shadow-xs"
                        title="Hapus Tautan Link"
                    >
                        <Link2Off className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('insertHorizontalRule')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs transition-all disabled:opacity-50 shadow-xs"
                        title="Garis Pemisah Horizontal (Divider)"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('removeFormat')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs transition-all disabled:opacity-50 shadow-xs"
                        title="Hapus Semua Format Teks"
                    >
                        <RemoveFormatting className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-slate-300 mx-1"></div>

                    {/* Undo / Redo */}
                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('undo')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs transition-all disabled:opacity-50 shadow-xs"
                        title="Urungkan (Undo) - Ctrl+Z"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        disabled={mode !== 'visual'}
                        onClick={() => executeCommand('redo')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs transition-all disabled:opacity-50 shadow-xs"
                        title="Ulangi (Redo) - Ctrl+Y"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                {/* View Mode Tabs (Visual, HTML Source, Preview) */}
                <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setMode('visual')}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 ${
                            mode === 'visual'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mode Visual (Teks Biasa)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('code')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 ${
                            mode === 'code'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Tampilkan Kode HTML Sumber"
                    >
                        <Code className="w-3.5 h-3.5" />
                        <span>Kode HTML</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 ${
                            mode === 'preview'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                    </button>
                </div>
            </div>

            {/* Editor Workspace Content */}
            <div className="relative flex-1 bg-slate-50/40 p-4 sm:p-6">
                {/* 1. VISUAL WYSIWYG MODE */}
                {mode === 'visual' && (
                    <div className="relative min-h-[320px]">
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning={true}
                            onInput={handleInput}
                            onSelect={updateActiveFormats}
                            onKeyUp={updateActiveFormats}
                            onMouseUp={updateActiveFormats}
                            onBlur={handleInput}
                            style={{ minHeight }}
                            className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-inner leading-relaxed overflow-y-auto text-sm rich-editor-content prose max-w-none"
                            tabIndex={0}
                        />
                        {isEmpty && (
                            <div className="absolute top-5 left-5 text-slate-400 pointer-events-none text-sm select-none">
                                {placeholder}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. HTML SOURCE CODE MODE */}
                {mode === 'code' && (
                    <div>
                        <textarea
                            rows="14"
                            value={stringValue}
                            onChange={(e) => onChange && onChange(e.target.value)}
                            placeholder="Kode HTML konten..."
                            className="w-full p-4 bg-slate-900 text-amber-300 font-mono text-xs border border-slate-700 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed shadow-inner"
                            style={{ minHeight }}
                        />
                        <p className="text-[11px] text-slate-500 mt-1.5">
                            * Anda dapat mengedit tag HTML secara manual di sini, lalu kembali ke Mode Visual kapan saja.
                        </p>
                    </div>
                )}

                {/* 3. PREVIEW MODE */}
                {mode === 'preview' && (
                    <div
                        style={{ minHeight }}
                        className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto"
                    >
                        {stringValue ? (
                            <div
                                className="prose prose-slate max-w-none text-slate-800 leading-relaxed rich-editor-content text-sm sm:text-base"
                                dangerouslySetInnerHTML={{ __html: stringValue }}
                            />
                        ) : (
                            <div className="text-center py-16 text-slate-400 italic text-sm">
                                Belum ada isi artikel yang ditulis untuk ditampilkan dalam pratinjau.
                            </div>
                        )}
                    </div>
                )}

                {error && <p className="text-rose-500 text-xs mt-2 font-medium">{error}</p>}
            </div>

            {/* Footer Status Bar: Word Count, Char Count, Read Time, & Tips */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-slate-700">
                        {wordCount} <span className="text-slate-400 font-normal">kata</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="font-semibold text-slate-700">
                        {charCount} <span className="text-slate-400 font-normal">karakter</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-amber-700 font-medium flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Estimasi baca ~{readingTimeMinutes} mnt</span>
                    </span>
                </div>

                <div className="text-[11px] text-slate-400 hidden sm:block">
                    Format aktif otomatis diterapkan ke teks yang sedang diseleksi / diketik.
                </div>
            </div>

            {/* Modal Dialog for Inserting Link */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                                <LinkIcon className="w-4 h-4 text-amber-600" />
                                <span>Sisipkan Tautan (Link)</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLinkModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={applyLink} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Teks Tautan (Opsional jika sudah memilih teks)
                                </label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Contoh: Kunjungi Halaman Katalog"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Alamat URL Target <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://perpustakaan.poltekindonusa.ac.id/..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Terapkan Tautan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
