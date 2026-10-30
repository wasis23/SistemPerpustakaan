<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class DevToolsController extends Controller
{
    public function index(): Response
    {
        abort_unless(app()->environment('local'), 403, 'Dev Tools hanya tersedia di environment lokal.');

        return Inertia::render('Petugas/DevTools/Index', [
            'env' => [
                'app_env' => app()->environment(),
                'app_debug' => config('app.debug'),
                'app_url' => config('app.url'),
                'db_connection' => config('database.default'),
                'db_database' => data_get(config('database.connections'), config('database.default') . '.database'),
                'php_version' => PHP_VERSION,
            ],
        ]);
    }

    public function runSeeder(Request $request): RedirectResponse
    {
        abort_unless(app()->environment('local'), 403);

        $request->validate([
            'type' => ['required', 'in:user,full'],
        ]);

        try {
            if ($request->type === 'user') {
                Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\UserSeeder']);
                $output = Artisan::output();
                return back()->with('success', "UserSeeder berhasil dijalankan.\n\n" . $output);
            }

            Artisan::call('db:seed');
            $output = Artisan::output();
            return back()->with('success', "DatabaseSeeder berhasil dijalankan.\n\n" . $output);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menjalankan seeder: ' . $e->getMessage());
        }
    }

    public function clearCache(Request $request): RedirectResponse
    {
        abort_unless(app()->environment('local'), 403);

        $request->validate([
            'action' => ['required', 'in:optimize_clear,config_clear,cache_clear,route_clear,view_clear,all'],
        ]);

        try {
            match ($request->action) {
                'optimize_clear' => Artisan::call('optimize:clear'),
                'config_clear' => Artisan::call('config:clear'),
                'cache_clear' => Artisan::call('cache:clear'),
                'route_clear' => Artisan::call('route:clear'),
                'view_clear' => Artisan::call('view:clear'),
                'all' => Artisan::call('optimize:clear'),
                default => null,
            };

            return back()->with('success', 'Cache berhasil dibersihkan (' . $request->action . ').');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membersihkan cache: ' . $e->getMessage());
        }
    }

    public function migrateFreshSeed(Request $request): RedirectResponse
    {
        abort_unless(app()->environment('local'), 403);

        $request->validate([
            'confirm' => ['required', 'accepted'],
        ], [
            'confirm.accepted' => 'Kamu harus mencentang konfirmasi untuk melanjutkan.',
        ]);

        try {
            Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
            $output = Artisan::output();
            return back()->with('success', "migrate:fresh --seed berhasil dijalankan.\n\n" . $output);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menjalankan migrate:fresh --seed: ' . $e->getMessage());
        }
    }
}
