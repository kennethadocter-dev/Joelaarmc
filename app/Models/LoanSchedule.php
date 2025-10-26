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
        'installment_balance', // renamed from remaining_amount
        'due_date',
        'is_paid',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'installment_balance' => 'decimal:2',
        'due_date' => 'datetime:Y-m-d',
        'is_paid' => 'boolean',
    ];

    /** 🔗 Each schedule belongs to a Loan */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * 🧮 Auto-update installment balance and payment status
     * every time this schedule is updated.
     */
    protected static function booted()
    {
        static::saving(function ($schedule) {
            // Auto-calculate remaining balance for this schedule
            $schedule->installment_balance = max(0, $schedule->amount - $schedule->amount_paid);

            // Auto-mark as paid if fully settled
            $schedule->is_paid = $schedule->installment_balance <= 0.01;

            // 🔁 Update the parent loan’s totals when any schedule changes
            if ($schedule->isDirty(['amount_paid', 'installment_balance'])) {
                $loan = $schedule->loan;
                if ($loan) {
                    // Recalculate totals from all schedules
                    $loan->amount_paid = DB::table('loan_schedules')
                        ->where('loan_id', $loan->id)
                        ->sum('amount_paid');

                    $loan->amount_remaining = DB::table('loan_schedules')
                        ->where('loan_id', $loan->id)
                        ->sum('installment_balance');

                    // Update loan status dynamically
                    if ($loan->amount_remaining <= 0.01) {
                        $loan->status = 'paid';
                    } elseif ($loan->amount_paid > 0) {
                        $loan->status = 'active';
                    }

                    $loan->save();
                }
            }
        });
    }
}