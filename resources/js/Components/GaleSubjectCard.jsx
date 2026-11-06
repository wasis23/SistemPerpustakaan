import React, { useState } from 'react';
import { ExternalLink, Copy, Check, KeyRound, ArrowRight, ShieldCheck, Newspaper, Atom, HeartPulse } from 'lucide-react';
import GaleLogo from './GaleLogo';

export const GALE_DATABASES = [
    {
        id: 'periodicals',
        codeKey: 'SPJ.SP00',
        title: 'Gale OneFile: Periodicals',
        subject: 'Terbitan Berkala & Humaniora',
        accessUrl: 'https://link.gale.com/apps/SPJ.SP00?u=fjathum',
        accessCode: 'solutions',
        description: 'Pangkalan data terbitan berkala ilmiah internasional, majalah akademik terkemuka, artikel berita global, dan referensi humaniora & sosial multidisiplin.',
        icon: Newspaper,
        accent: 'blue',
        prodiScope: 'Komunikasi Massa, Manajemen Ritel, Penyiaran & Umum',
        bgColor: 'bg-sky-50/60',
        borderColor: 'border-sky-200',
        badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
        btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
        ringColor: 'focus:ring-blue-500',
    },
    {
        id: 'science',
        codeKey: 'PPGS',
        title: 'Gale OneFile: Science',
        subject: 'Sains & Teknologi Terapan',
        accessUrl: 'https://link.gale.com/apps/PPGS?u=fjatsci',
        accessCode: 'discovery',
        description: 'Koleksi jurnal sains bereputasi internasional, rekayasa teknologi, eksperimen sains terapan, teknologi perangkat lunak, otomotif modern, dan matematika.',
        icon: Atom,
        accent: 'emerald',
        prodiScope: 'TRPL, Teknik Otomotif, Sistem Informasi & Sains Terapan',
        bgColor: 'bg-emerald-50/60',
        borderColor: 'border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        ringColor: 'focus:ring-emerald-500',
    },
    {
        id: 'nursing',
        codeKey: 'PPNU',
        title: 'Gale OneFile: Nursing and Allied Health',
        subject: 'Keperawatan & Ilmu Kesehatan',
        accessUrl: 'https://link.gale.com/apps/PPNU?u=fjathlt',
        accessCode: 'thriving',
        description: 'Database riset medis, literatur keperawatan terakreditasi, farmasi klinis, rekam medis informasi kesehatan (MIK), dan teknologi laboratorium medis (TLM).',
        icon: HeartPulse,
        accent: 'rose',
        prodiScope: 'Manajemen Info Kesehatan (MIK), Farmasi, TLM & Medis',
        bgColor: 'bg-rose-50/60',
        borderColor: 'border-rose-200',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
        ringColor: 'focus:ring-rose-500',
    },
];

export default function GaleSubjectCard({ db, isCompact = false }) {
    const [copied, setCopied] = useState(false);
    const IconComponent = db.icon;

    const copyAccessCode = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(db.accessCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    return (
        <div
            className={`rounded-3xl border ${db.borderColor} bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                isCompact ? 'p-5' : 'p-6 sm:p-7'
            }`}
        >
            <div className="space-y-4">
                {/* Header: Gale Brand + Subject Badge */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-slate-900 text-white shadow-sm flex items-center justify-center">
                            <GaleLogo className="h-4 sm:h-5 w-auto" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            {db.codeKey}
                        </span>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${db.badgeBg}`}>
                        {db.subject}
                    </span>
                </div>

                {/* Subject Title & Icon */}
                <div className="flex items-start space-x-3.5 pt-1">
                    <div
                        className={`w-12 h-12 rounded-2xl ${db.bgColor} border ${db.borderColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                    >
                        <IconComponent className="w-6 h-6 text-slate-800" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-950 group-hover:text-blue-700 transition-colors leading-snug">
                            {db.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500 pt-0.5">
                            Cakup: {db.prodiScope}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                    {db.description}
                </p>

                {/* Access Code Box */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <KeyRound className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Kode Akses Login
                            </p>
                            <p className="text-xs sm:text-sm font-mono font-black text-slate-900 truncate">
                                {db.accessCode}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={copyAccessCode}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 shrink-0 ${
                            copied
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                        title="Salin Kode Akses"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom: Action Link to Gale Login */}
            <div className="pt-4 mt-2 border-t border-slate-100">
                <a
                    href={db.accessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm group-hover:shadow ${db.btnBg}`}
                >
                    <span>Masuk Akses Login GALE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
}
