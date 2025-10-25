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
        'remaining_amount',
        'due_date',
        'is_paid',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'datetime:Y-m-d',
        'is_paid' => 'boolean',
    ];

    /** 🔗 Each schedule belongs to a Loan */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * 🧮 Auto-update remaining balance and payment status
     * every time this schedule is updated.
     */
    protected static function booted()
    {
        static::saving(function ($schedule) {
            // Auto-update remaining balance
            $schedule->remaining_amount = max(0, $schedule->amount - $schedule->amount_paid);

            // Auto-mark as paid if fully settled
            $schedule->is_paid = $schedule->remaining_amount <= 0.01;

            // Optional: update the parent loan’s summary
            if ($schedule->isDirty(['amount_paid', 'remaining_amount'])) {
                $loan = $schedule->loan;
                if ($loan) {
                    // Recalculate totals for the loan
                    $loan->amount_paid = DB::table('loan_schedules')
                        ->where('loan_id', $loan->id)
                        ->sum('amount_paid');

                    $loan->amount_remaining = DB::table('loan_schedules')
                        ->where('loan_id', $loan->id)
                        ->sum('remaining_amount');

                    // Update loan status
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