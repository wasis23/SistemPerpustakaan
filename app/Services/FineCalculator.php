<?php

namespace App\Services;

use App\Models\Holiday;
use App\Models\Setting;
use Carbon\Carbon;

class FineCalculator
{
    /**
     * Hitung kalkulasi denda keterlambatan dengan aturan:
     * 1. Hari Minggu otomatis bebas denda (tidak dihitung denda)
     * 2. Tanggal merah yang diinputkan pustakawan bebas denda (tidak dihitung denda)
     *
     * @param Carbon|string $dueDate
     * @param Carbon|string|null $returnDate
     * @param float|null $finePerDay
     * @return array
     */
    public static function calculate(Carbon|string $dueDate, Carbon|string|null $returnDate = null, ?float $finePerDay = null): array
    {
        $finePerDay = $finePerDay ?? (float) Setting::get('fine_per_day', 1000);
        $due = $dueDate instanceof Carbon ? $dueDate->copy() : Carbon::parse($dueDate);
        $return = $returnDate 
            ? ($returnDate instanceof Carbon ? $returnDate->copy() : Carbon::parse($returnDate)) 
            : Carbon::now();

        if ($return->lte($due)) {
            return [
                'is_overdue' => false,
                'due_date' => $due->format('d M Y (H:i)'),
                'return_date' => $return->format('d M Y (H:i)'),
                'total_overdue_days' => 0,
                'fineable_days' => 0,
                'sunday_exempt_days' => 0,
                'holiday_exempt_days' => 0,
                'total_exempt_days' => 0,
                'fine_per_day' => $finePerDay,
                'fine_amount' => 0.0,
                'breakdown' => [],
            ];
        }

        // Tentukan daftar tanggal kalender yang terlewat
        /** @var Carbon[] $datesToCheck */
        $datesToCheck = [];
        if ($due->format('Y-m-d') === $return->format('Y-m-d')) {
            $datesToCheck[] = $return->copy()->startOfDay();
        } else {
            $curr = $due->copy()->addDay()->startOfDay();
            $end = $return->copy()->startOfDay();
            while ($curr->lte($end)) {
                $datesToCheck[] = $curr->copy();
                $curr->addDay();
            }
        }

        if (empty($datesToCheck)) {
            $datesToCheck[] = $return->copy()->startOfDay();
        }

        $firstDate = $datesToCheck[0]->format('Y-m-d');
        $lastDate = end($datesToCheck)->format('Y-m-d');

        $holidays = Holiday::whereBetween('holiday_date', [$firstDate, $lastDate])
            ->get()
            ->keyBy(fn ($h) => Carbon::parse($h->holiday_date)->format('Y-m-d'));

        $sundayExemptDays = 0;
        $holidayExemptDays = 0;
        $fineableDays = 0;
        $breakdown = [];

        foreach ($datesToCheck as $dt) {
            $dateKey = $dt->format('Y-m-d');
            $isSunday = $dt->isSunday();
            $holiday = $holidays->get($dateKey);

            if ($isSunday) {
                $sundayExemptDays++;
                $breakdown[] = [
                    'date' => $dateKey,
                    'day_name' => 'Minggu',
                    'is_exempt' => true,
                    'type' => 'sunday',
                    'reason' => 'Hari Minggu (Bebas Denda Otomatis)',
                ];
            } elseif ($holiday) {
                $holidayExemptDays++;
                $breakdown[] = [
                    'date' => $dateKey,
                    'day_name' => $dt->locale('id')->isoFormat('dddd'),
                    'is_exempt' => true,
                    'type' => 'holiday',
                    'reason' => 'Tanggal Merah: ' . $holiday->name,
                ];
            } else {
                $fineableDays++;
                $breakdown[] = [
                    'date' => $dateKey,
                    'day_name' => $dt->locale('id')->isoFormat('dddd'),
                    'is_exempt' => false,
                    'type' => 'fineable',
                    'reason' => 'Dikenakan Denda Keterlambatan',
                ];
            }
        }

        $totalOverdueDays = count($datesToCheck);
        $totalExemptDays = $sundayExemptDays + $holidayExemptDays;
        $fineAmount = $fineableDays * $finePerDay;

        return [
            'is_overdue' => true,
            'due_date' => $due->format('d M Y (H:i)'),
            'return_date' => $return->format('d M Y (H:i)'),
            'total_overdue_days' => $totalOverdueDays,
            'fineable_days' => $fineableDays,
            'sunday_exempt_days' => $sundayExemptDays,
            'holiday_exempt_days' => $holidayExemptDays,
            'total_exempt_days' => $totalExemptDays,
            'fine_per_day' => $finePerDay,
            'fine_amount' => (float)$fineAmount,
            'breakdown' => $breakdown,
        ];
    }
}
