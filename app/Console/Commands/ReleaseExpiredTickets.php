<?php

namespace App\Console\Commands;

use App\Models\BookCopy;
use App\Models\BorrowTicket;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReleaseExpiredTickets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simpus:release-tickets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rilis eksemplar buku yang ditahan oleh tiket peminjaman kadaluwarsa (>5 menit)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $released = BorrowTicket::releaseExpiredTickets();
        $this->info("Berhasil merilis {$released} tiket kadaluwarsa dan mengembalikan stok eksemplar ke status available.");
    }
}
