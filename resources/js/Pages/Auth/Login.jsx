import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { BookOpen, User, Lock, ArrowRight, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-12 relative overflow-hidden font-sans">
            <Head title="Masuk Ke Portal - SIMPUS Digital" />

            {/* Background Ambient Warm Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Back to Home Button */}
                <div className="mb-6 flex justify-start">
                    <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-amber-700 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>

                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 shadow-xl mb-4">
                        <BookOpen className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                        SIMPUS<span className="text-amber-600">.</span>
                    </h1>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                        Portal Otentikasi Perpustakaan Digital Politeknik Indonusa Surakarta
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-8 border border-amber-900/10 shadow-2xl space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username/NIM Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                                Username / NIM / NIDN
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan NIM atau Nama Pengguna"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium transition-all"
                                    required
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.username}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium transition-all"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 bg-slate-50 text-amber-600 focus:ring-amber-500"
                                />
                                <span>Ingat Saya</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <span>{processing ? 'Memproses...' : 'Masuk Ke Portal'}</span>
                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </form>
                </div>

                {/* Role Switch Info Footer */}
                <div className="mt-6 text-center space-y-2">
                    <div className="inline-flex items-center space-x-1.5 text-xs text-slate-600 bg-white/80 border border-amber-900/10 px-4 py-2 rounded-full shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Autentikasi Otomatis (Anggota & Petugas Pustakawan)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
