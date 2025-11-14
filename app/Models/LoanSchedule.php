<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class LoanSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'payment_number',
        'amount',
        'amount_paid',
        'amount_left',
        'is_paid',
        'due_date',
        'note',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'due_date' => 'date',
    ];

    /* ───────────────────────────────
     |  🔗 RELATIONSHIPS
     ─────────────────────────────── */

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    /* ───────────────────────────────
     |  ⚡ AUTO-UPDATE HOOKS
     ─────────────────────────────── */

    protected static function booted()
    {
        // When a schedule is created
        static::created(function (LoanSchedule $schedule) {
            static::recalculateLoan($schedule);
        });

        // When a schedule is updated (for example, payment applied)
        static::updated(function (LoanSchedule $schedule) {
            static::recalculateLoan($schedule);
        });

        // When a schedule is deleted
        static::deleted(function (LoanSchedule $schedule) {
            static::recalculateLoan($schedule);
        });
    }

    /* ───────────────────────────────
     |  🔁 CENTRAL RECALCULATION
     ─────────────────────────────── */

    protected static function recalculateLoan(LoanSchedule $schedule)
    {
        try {
            $loan = $schedule->loan;
            if (!$loan) return;

            // 🔄 Recalculate totals
            $loan->amount_remaining = LoanSchedule::where('loan_id', $loan->id)->sum('amount_left');
            $loan->amount_paid = $loan->total_with_interest - $loan->amount_remaining;

            // 🧮 Recalculate interest & totals
            $loan->expected_interest = $loan->calculateExpectedInterest();
            $loan->total_with_interest = $loan->calculateTotalWithInterest();

            // ✅ Update loan status
            if ($loan->amount_remaining <= 0.01) {
                $loan->status = 'paid';
                $loan->expected_interest = 0.00;
                $loan->interest_earned = round(($loan->amount_paid - $loan->amount), 2);
            } elseif ($loan->due_date && $loan->due_date->isPast() && $loan->status !== 'paid') {
                $loan->status = 'overdue';
            } else {
                $loan->status = 'active';
            }

            $loan->save();
            Log::info("📅 LoanSchedule update synced Loan #{$loan->id}");
        } catch (\Throwable $e) {
            Log::error('❌ LoanSchedule sync failed', [
                'loan_id' => $schedule->loan_id ?? 'unknown',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);
        }
    }

    /* ───────────────────────────────
     |  📊 HELPER FUNCTIONS
     ─────────────────────────────── */

    public function markAsPaid(float $amount = null): void
    {
        $amountToApply = $amount ?? ($this->amount - $this->amount_paid);
        $this->amount_paid += $amountToApply;
        $this->amount_left = max(0, $this->amount - $this->amount_paid);
        $this->is_paid = $this->amount_left <= 0.01;
        $this->save();
    }
}