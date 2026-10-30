<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SyncSiakadMembers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'siakad:sync-members {--force : Paksa perbarui seluruh data anggota}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi mahasiswa aktif (angkatan 21-26) dan dosen aktif dari SIAKAD ke database anggota SIMPUS tanpa duplikasi';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Memulai sinkronisasi data anggota dari SIAKAD...');

        $syncedStudents = 0;
        $updatedStudents = 0;
        $syncedLecturers = 0;
        $updatedLecturers = 0;
        $skipped = 0;

        // =========================================================================
        // 1. SINKRONISASI DOSEN AKTIF (id_stat_aktif IN 1, 2)
        // =========================================================================
        $this->info('1/2. Menarik data Dosen Aktif dari SIAKAD...');

        try {
            $activeLecturers = DB::connection('siakad')
                ->table('wsia_dosen')
                ->whereIn('id_stat_aktif', [1, 2])
                ->get();

            $dosenPtMap = DB::connection('siakad')
                ->table('viewDosenPt')
                ->select('id_ptk', 'xid_ptk', 'nidn', 'nm_prodi')
                ->get()
                ->keyBy(function ($item) {
                    return $item->nidn ?: ($item->id_ptk ?: $item->xid_ptk);
                });

            foreach ($activeLecturers as $dosen) {
                $rawUsername = trim($dosen->nidn ?: ($dosen->nip ?: ($dosen->niy_nigk ?: $dosen->xid_ptk)));
                if (empty($rawUsername)) {
                    $skipped++;
                    continue;
                }

                $fullName = trim($dosen->nm_ptk);
                $gelarDepan = trim((string)($dosen->gelar_depan ?? ''));
                $gelarBelakang = trim((string)($dosen->gelar_belakang ?? ''));

                if ($gelarDepan) {
                    $fullName = $gelarDepan . ' ' . $fullName;
                }
                if ($gelarBelakang) {
                    $fullName = $fullName . ', ' . $gelarBelakang;
                }

                $dosenPt = $dosenPtMap->get($dosen->nidn) ?? $dosenPtMap->get($dosen->id_ptk) ?? $dosenPtMap->get($dosen->xid_ptk);
                $prodi = $dosenPt->nm_prodi ?? 'Dosen Politeknik Indonusa Surakarta';
                $phone = !empty($dosen->no_hp) ? preg_replace('/[^0-9+]/', '', trim($dosen->no_hp)) : null;

                $rawEmail = trim($dosen->email_poltek ?: ($dosen->email ?: ''));
                $email = (!empty($rawEmail) && filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) ? $rawEmail : null;

                $existing = User::where('username', $rawUsername)->first();

                if ($existing) {
                    if ($existing->role !== 'anggota') {
                        $skipped++;
                        continue;
                    }

                    $updateData = [
                        'name' => $fullName,
                        'prodi' => $prodi,
                        'status' => 'active',
                    ];

                    if (!empty($phone)) {
                        $updateData['phone'] = $phone;
                    }

                    if (!empty($email)) {
                        $isUsed = User::where('email', $email)->where('id', '!=', $existing->id)->exists();
                        if (!$isUsed) {
                            $updateData['email'] = $email;
                        }
                    }

                    $existing->update($updateData);
                    $updatedLecturers++;
                } else {
                    $finalEmail = null;
                    if (!empty($email)) {
                        $isUsed = User::where('email', $email)->exists();
                        if (!$isUsed) {
                            $finalEmail = $email;
                        }
                    }

                    $passwordVal = strlen($rawUsername) < 6 ? str_pad($rawUsername, 6, '0', STR_PAD_RIGHT) : $rawUsername;

                    User::create([
                        'username' => $rawUsername,
                        'name' => $fullName,
                        'email' => $finalEmail,
                        'password' => Hash::make($passwordVal),
                        'role' => 'anggota',
                        'prodi' => $prodi,
                        'phone' => $phone,
                        'status' => 'active',
                    ]);
                    $syncedLecturers++;
                }
            }

            $this->info("   -> Selesai memproses Dosen: {$syncedLecturers} baru ditambahkan, {$updatedLecturers} diperbarui.");
        } catch (\Throwable $e) {
            $this->error('Gagal memproses dosen dari SIAKAD: ' . $e->getMessage());
            Log::error('Gagal sync dosen SIAKAD: ' . $e->getMessage());
        }

        // =========================================================================
        // 2. SINKRONISASI MAHASISWA AKTIF ANGKATAN 21 - 26
        // =========================================================================
        $this->info('2/2. Menarik data Mahasiswa Aktif (Angkatan 21, 22, 23, 24, 25, 26) dari SIAKAD...');

        try {
            $rawActiveStudents = DB::connection('siakad')
                ->table('viewMahasiswaPt')
                ->where('status', 'Aktif')
                ->whereIn(DB::raw('SUBSTRING(nipd, 2, 2)'), ['21', '22', '23', '24', '25', '26'])
                ->get();

            // Deduplikasi NIM di level memori (karena 1 mahasiswa bisa memiliki >1 id_reg_pd di viewMahasiswaPt)
            $activeStudents = $rawActiveStudents->unique(function ($item) {
                return strtoupper(trim((string)$item->nipd));
            })->values();

            $totalStudents = $activeStudents->count();
            $this->info("   -> Ditemukan {$totalStudents} mahasiswa aktif unik angkatan 21-26 di SIAKAD.");

            // Ambil biodata tambahan (HP & Email) dari wsia_mahasiswa
            $studentIds = $activeStudents->pluck('id_pd')->filter()->unique()->toArray();
            $studentXids = $activeStudents->pluck('xid_pd')->filter()->unique()->toArray();

            $bioMap = collect();
            if (!empty($studentIds) || !empty($studentXids)) {
                $bioRows = DB::connection('siakad')
                    ->table('wsia_mahasiswa')
                    ->where(function ($q) use ($studentIds, $studentXids) {
                        if (!empty($studentIds)) {
                            $q->whereIn('id_pd', $studentIds);
                        }
                        if (!empty($studentXids)) {
                            $q->orWhereIn('xid_pd', $studentXids);
                        }
                    })
                    ->select('id_pd', 'xid_pd', 'nm_pd', 'email_poltek', 'email', 'telepon_seluler', 'telepon_rumah')
                    ->get();

                foreach ($bioRows as $b) {
                    if (!empty($b->id_pd)) $bioMap->put($b->id_pd, $b);
                    if (!empty($b->xid_pd)) $bioMap->put($b->xid_pd, $b);
                }
            }

            $bar = $this->output->createProgressBar($totalStudents);
            $bar->start();

            $processedUsernames = [];

            foreach ($activeStudents as $student) {
                $username = strtoupper(trim((string)$student->nipd));
                if (empty($username) || isset($processedUsernames[$username])) {
                    $bar->advance();
                    continue;
                }

                $processedUsernames[$username] = true;

                $bio = (!empty($student->id_pd) && $bioMap->has($student->id_pd))
                    ? $bioMap->get($student->id_pd)
                    : ((!empty($student->xid_pd) && $bioMap->has($student->xid_pd)) ? $bioMap->get($student->xid_pd) : null);

                $name = trim($bio->nm_pd ?? $student->nm_pd ?? $username);
                $prodi = trim($student->nm_lemb ?? $student->nm_prodi ?? 'Politeknik Indonusa Surakarta');

                $rawPhone = trim($bio->telepon_seluler ?? $bio->telepon_rumah ?? $student->telepon_seluler ?? '');
                $phone = !empty($rawPhone) ? preg_replace('/[^0-9+]/', '', $rawPhone) : null;

                $rawEmail = trim($bio->email_poltek ?: ($bio->email ?: ($student->email ?: '')));
                $email = (!empty($rawEmail) && filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) ? $rawEmail : null;

                $existing = User::where('username', $username)->first();

                if ($existing) {
                    if ($existing->role !== 'anggota') {
                        $bar->advance();
                        continue;
                    }

                    $updatePayload = [
                        'name' => $name,
                        'prodi' => $prodi,
                        'status' => 'active',
                    ];

                    if (!empty($phone)) {
                        $updatePayload['phone'] = $phone;
                    }

                    if (!empty($email)) {
                        $isUsed = User::where('email', $email)->where('id', '!=', $existing->id)->exists();
                        if (!$isUsed) {
                            $updatePayload['email'] = $email;
                        }
                    }

                    $existing->update($updatePayload);
                    $updatedStudents++;
                } else {
                    $finalEmail = null;
                    if (!empty($email)) {
                        $isUsed = User::where('email', $email)->exists();
                        if (!$isUsed) {
                            $finalEmail = $email;
                        }
                    }

                    $passwordVal = strlen($username) < 6 ? str_pad($username, 6, '0', STR_PAD_RIGHT) : $username;

                    User::create([
                        'username' => $username,
                        'name' => $name,
                        'email' => $finalEmail,
                        'password' => Hash::make($passwordVal),
                        'role' => 'anggota',
                        'prodi' => $prodi,
                        'phone' => $phone,
                        'status' => 'active',
                    ]);
                    $syncedStudents++;
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("   -> Selesai memproses Mahasiswa: {$syncedStudents} baru ditambahkan, {$updatedStudents} diperbarui.");
        } catch (\Throwable $e) {
            $this->error('Gagal memproses mahasiswa dari SIAKAD: ' . $e->getMessage());
            Log::error('Gagal sync mahasiswa SIAKAD: ' . $e->getMessage());
        }

        $totalBaru = $syncedStudents + $syncedLecturers;
        $totalUpdate = $updatedStudents + $updatedLecturers;

        $this->newLine();
        $this->info("=================================================================");
        $this->info(" SINKRONISASI SELESAI!");
        $this->info(" - Anggota Baru Ditambahkan : {$totalBaru} orang ({$syncedStudents} Mhs, {$syncedLecturers} Dosen)");
        $this->info(" - Data Anggota Diperbarui  : {$totalUpdate} orang ({$updatedStudents} Mhs, {$updatedLecturers} Dosen)");
        $this->info("=================================================================");

        return Command::SUCCESS;
    }
}
