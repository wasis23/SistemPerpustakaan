<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('member_type', 30)->default('mahasiswa')->after('role')->index();
        });

        // Set member_type awal berdasarkan data pengguna yang ada
        DB::table('users')->where('role', 'anggota')->where(function ($q) {
            $q->where('prodi', 'like', '%Eksternal%')
              ->orWhere('username', 'like', 'eks%');
        })->update(['member_type' => 'eksternal']);

        DB::table('users')->where('role', 'anggota')->where(function ($q) {
            $q->where('prodi', 'like', '%dosen%')
              ->orWhere('prodi', 'like', '%tendik%')
              ->orWhere('prodi', 'like', '%pegawai%')
              ->orWhere('prodi', 'like', '%staf%')
              ->orWhere('prodi', 'like', '%staff%')
              ->orWhere('username', 'like', 'dsn%')
              ->orWhere('username', 'like', 'nip%')
              ->orWhere('username', 'like', 'nidn%');
        })->update(['member_type' => 'dosen_tendik']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('member_type');
        });
    }
};
