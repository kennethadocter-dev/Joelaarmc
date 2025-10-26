<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class LoanSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'payment_number',
        'amount',
        'amount_paid',
        'amount_left',
        'due_date',
        'is_paid',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'amount_left' => 'decimal:2',
        'due_date' => 'datetime:Y-m-d',
        'is_paid' => 'boolean',
    ];

    /** 🔗 Relationship: belongs to a Loan */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * 🧮 Automatically update amount_left, is_paid,
     * and sync parent Loan totals when saving.
     */
    protected static function booted()
    {
        static::saving(function (self $schedule) {
            // 1️⃣ Ensure amount_left is always correct
            $schedule->amount_left = max(0, $schedule->amount - $schedule->amount_paid);

            // 2️⃣ Auto-mark as paid if cleared
            $schedule->is_paid = $schedule->amount_left <= 0.01;

            // 3️⃣ Sync parent loan totals (without recursion)
            if ($schedule->isDirty(['amount_paid', 'amount_left'])) {
                $loan = $schedule->loan;
                if ($loan) {
                    $totals = DB::table('loan_schedules')
                        ->selectRaw('SUM(amount_paid) as total_paid, SUM(amount_left) as total_left')
                        ->where('loan_id', $loan->id)
                        ->first();

                    $loan->amount_paid = $totals->total_paid ?? 0;
                    $loan->amount_remaining = $totals->total_left ?? 0;

                    if ($loan->amount_remaining <= 0.01) {
                        $loan->status = 'paid';
                    } elseif ($loan->amount_paid > 0) {
                        $loan->status = 'active';
                    }

                    // ✅ Prevent infinite recursion by saving directly to DB
                    DB::table('loans')->where('id', $loan->id)->update([
                        'amount_paid'      => $loan->amount_paid,
                        'amount_remaining' => $loan->amount_remaining,
                        'status'           => $loan->status,
                        'updated_at'       => now(),
                    ]);
                }
            }
        });
    }
}