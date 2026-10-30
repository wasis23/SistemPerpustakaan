import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Database, Users, Upload, FileDown, Trash2, RefreshCw, AlertTriangle, Terminal, Info } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ env }) {
    const { flash } = usePage().props;
    const seederForm = useForm({ type: 'user' });
    const cacheForm = useForm({ action: 'optimize_clear' });
    const freshForm = useForm({ confirm: false });

    const runSeeder = (type) => {
        seederForm.setData('type', type);
        seederForm.post('/petugas/dev/tools/run-seeder', { preserveScroll: true });
    };

    const runCache = (action) => {
        cacheForm.setData('action', action);
        cacheForm.post('/petugas/dev/tools/clear-cache', { preserveScroll: true });
    };

    const runFresh = (e) => {
        e.preventDefault();
        if (!freshForm.data.confirm) {
            alert('Centang konfirmasi terlebih dahulu.');
            return;
        }
        if (confirm('PERINGATAN!\n\nSemua data di database akan DIHAPUS TOTAL (migrate:fresh) lalu di-seed ulang.\n\nLanjutkan?')) {
            freshForm.post('/petugas/dev/tools/migrate-fresh-seed', { preserveScroll: true });
        }
    };

    return (
        <PetugasLayout activeMenu="dev-tools">
            <Head title="Dev Tools - Local Only" />

            <div className="space-y-6 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-amber-600" />
                            Dev Tools
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Hanya tersedia untuk environment lokal</p>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200">LOCAL MODE</div>
                </div>

                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800 whitespace-pre-wrap">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">{flash.error}</div>
                )}

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-500" />
                        <h2 className="font-bold text-slate-900 text-sm">Informasi Environment</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-slate-500">APP_ENV:</span> <span className="font-semibold text-slate-900">{env?.app_env}</span></div>
                        <div><span className="text-slate-500">APP_DEBUG:</span> <span className="font-semibold text-slate-900">{String(env?.app_debug)}</span></div>
                        <div><span className="text-slate-500">APP_URL:</span> <span className="font-semibold text-slate-900">{env?.app_url}</span></div>
                        <div><span className="text-slate-500">DB_CONNECTION:</span> <span className="font-semibold text-slate-900">{env?.db_connection}</span></div>
                        <div><span className="text-slate-500">DB_DATABASE:</span> <span className="font-semibold text-slate-900">{env?.db_database || '-'}</span></div>
                        <div><span className="text-slate-500">PHP_VERSION:</span> <span className="font-semibold text-slate-900">{env?.php_version}</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <h2 className="font-bold text-slate-900 text-sm">Seeder</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <button onClick={() => runSeeder('user')} disabled={seederForm.processing} className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2">
                                <Database className="w-4 h-4" />
                                {seederForm.processing && seederForm.data.type === 'user' ? 'Menjalankan...' : 'Jalankan UserSeeder'}
                            </button>
                            <button onClick={() => runSeeder('full')} disabled={seederForm.processing} className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2">
                                <Database className="w-4 h-4" />
                                {seederForm.processing && seederForm.data.type === 'full' ? 'Menjalankan...' : 'Jalankan DatabaseSeeder'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-indigo-600" />
                            <h2 className="font-bold text-slate-900 text-sm">Import Data</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <a href="/petugas/circulations/import/template" className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border border-slate-200">
                                <FileDown className="w-4 h-4" />
                                Template Import Peminjaman
                            </a>
                            <a href="/petugas/circulations" className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                Halaman Import Peminjaman
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-sky-600" />
                            <h2 className="font-bold text-slate-900 text-sm">Cache</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-2">
                            <button onClick={() => runCache('optimize_clear')} disabled={cacheForm.processing} className="px-3 py-2 text-xs bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold">optimize:clear</button>
                            <button onClick={() => runCache('config_clear')} disabled={cacheForm.processing} className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-semibold border border-slate-200">config:clear</button>
                            <button onClick={() => runCache('cache_clear')} disabled={cacheForm.processing} className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-semibold border border-slate-200">cache:clear</button>
                            <button onClick={() => runCache('route_clear')} disabled={cacheForm.processing} className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-semibold border border-slate-200">route:clear</button>
                            <button onClick={() => runCache('view_clear')} disabled={cacheForm.processing} className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-semibold border border-slate-200">view:clear</button>
                            <button onClick={() => runCache('all')} disabled={cacheForm.processing} className="px-3 py-2 text-xs bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-semibold">all</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-rose-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-rose-100 flex items-center gap-2 bg-rose-50/50">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <h2 className="font-bold text-rose-900 text-sm">Danger Zone</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-xs text-rose-700">Perintah ini akan menghapus SEMUA data di database lalu menjalankan ulang migrasi + seeder.</p>
                            <form onSubmit={runFresh} className="space-y-2">
                                <label className="flex items-center gap-2 text-xs text-slate-700">
                                    <input type="checkbox" checked={freshForm.data.confirm} onChange={(e) => freshForm.setData('confirm', e.target.checked)} className="rounded border-slate-300" />
                                    Saya paham konsekuensinya
                                </label>
                                <button type="submit" disabled={freshForm.processing} className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    {freshForm.processing ? 'Menjalankan...' : 'migrate:fresh --seed'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}
