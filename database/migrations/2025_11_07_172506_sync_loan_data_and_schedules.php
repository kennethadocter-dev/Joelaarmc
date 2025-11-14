<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $loans = DB::table('loans')->get();

            foreach ($loans as $loan) {
                $amount = (float)$loan->amount;
                $rate = (float)$loan->interest_rate;
                $term = (int)$loan->term_months;

                // ✅ Recompute totals
                $interestTotal = round($amount * ($rate / 100) * $term, 2);
                $totalWithInterest = $amount + $interestTotal;

                // ✅ Sum existing payments
                $totalPaid = DB::table('payments')
                    ->where('loan_id', $loan->id)
                    ->sum('amount');

                // ✅ Sum schedule remaining
                $scheduleRemaining = DB::table('loan_schedules')
                    ->where('loan_id', $loan->id)
                    ->sum('amount_left');

                // ✅ If no schedules exist, rebuild
                if ($scheduleRemaining == 0 && $totalPaid < $totalWithInterest) {
                    DB::table('loan_schedules')->where('loan_id', $loan->id)->delete();

                    $monthly = round($totalWithInterest / max($term, 1), 2);
                    $assigned = 0.00;
                    for ($i = 1; $i <= $term; $i++) {
                        $val = ($i < $term)
                            ? $monthly
                            : round($totalWithInterest - $assigned, 2);
                        $assigned += $val;

                        DB::table('loan_schedules')->insert([
                            'loan_id' => $loan->id,
                            'payment_number' => $i,
                            'amount' => $val,
                            'amount_paid' => 0.00,
                            'amount_left' => $val,
                            'is_paid' => false,
                            'due_date' => Carbon::parse($loan->start_date)->addMonths($i),
                            'note' => 'Synced',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    $scheduleRemaining = $totalWithInterest;
                }

                // ✅ Derive status
                $status = 'pending';
                if ($totalPaid > 0 && $totalPaid < $totalWithInterest) {
                    $status = 'active';
                } elseif ($totalPaid >= $totalWithInterest) {
                    $status = 'paid';
                }

                // ✅ Update loan table
                DB::table('loans')
                    ->where('id', $loan->id)
                    ->update([
                        'interest_earned' => $interestTotal,
                        'total_with_interest' => $totalWithInterest,
                        'amount_paid' => $totalPaid,
                        'amount_remaining' => max($totalWithInterest - $totalPaid, 0),
                        'status' => $status,
                        'updated_at' => now(),
                    ]);

                // ✅ Fix schedule paid flags
                $schedules = DB::table('loan_schedules')->where('loan_id', $loan->id)->get();
                foreach ($schedules as $s) {
                    $isPaid = $s->amount_left <= 0.01;
                    DB::table('loan_schedules')->where('id', $s->id)->update([
                        'is_paid' => $isPaid,
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        // No rollback — sync is one-way
    }
};