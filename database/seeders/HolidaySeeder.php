<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $holidays = [
            ['holiday_date' => '2026-01-01', 'name' => 'Tahun Baru Masehi', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-02-17', 'name' => 'Tahun Baru Imlek 2577 Kongzili', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-03-20', 'name' => 'Hari Raya Nyepi Tahun Baru Saka 1948', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-03-21', 'name' => 'Hari Raya Idul Fitri 1447 H', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-03-22', 'name' => 'Hari Raya Idul Fitri 1447 H (Hari Ke-2)', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-04-03', 'name' => 'Wafat Yesus Kristus', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-05-01', 'name' => 'Hari Buruh Internasional', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-05-14', 'name' => 'Kenaikan Yesus Kristus', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-05-27', 'name' => 'Hari Raya Idul Adha 1447 H', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-05-31', 'name' => 'Hari Raya Waisak 2570 BE', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-06-01', 'name' => 'Hari Lahir Pancasila', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-06-16', 'name' => 'Tahun Baru Islam 1448 H', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-08-17', 'name' => 'Hari Kemerdekaan RI ke-81', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-08-25', 'name' => 'Maulid Nabi Muhammad SAW', 'description' => 'Libur Nasional'],
            ['holiday_date' => '2026-12-25', 'name' => 'Hari Raya Natal', 'description' => 'Libur Nasional'],
        ];

        foreach ($holidays as $item) {
            Holiday::firstOrCreate(
                ['holiday_date' => $item['holiday_date']],
                [
                    'name' => $item['name'],
                    'description' => $item['description'],
                ]
            );
        }
    }
}
