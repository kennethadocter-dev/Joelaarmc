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
        'amount_left', // ✅ renamed
        'due_date',
        'is_paid',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'amount_left' => 'decimal:2', // ✅ renamed
        'due_date' => 'datetime:Y-m-d',
        'is_paid' => 'boolean',
    ];

    /** 🔗 Each schedule belongs to a Loan */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * 🧮 Auto-update balance and status on every save
     */
    protected static function booted()
    {
        static::saving(function ($schedule) {
            // Auto-update balance
            $schedule->amount_left = max(0, $schedule->amount - $schedule->amount_paid);

            // Auto-mark as paid if settled
            $schedule->is_paid = $schedule->amount_left <= 0.01;

            // Update parent loan totals
            if ($schedule->isDirty(['amount_paid', 'amount_left'])) {
                $loan = $schedule->loan;
                if ($loan) {
                    $loan->amount_paid = DB::table('loan_schedules')
                        ->where('loan_id', $loan->id)
                        ->sum('amount_paid');

                    $loan->amount_remaining = DB::table('loan_schedules')
                        ->where('loan_id', $loan->id)
                        ->sum('amount_left');

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