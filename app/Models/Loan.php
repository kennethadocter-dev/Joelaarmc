<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class Loan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'customer_id',
        'client_name',
        'amount',
        'expected_interest',
        'interest_rate',
        'term_months',
        'start_date',
        'due_date',
        'status',
        'amount_paid',
        'amount_remaining',
        'interest_earned',
        'total_with_interest',
        'notes',
        'disbursed_at',
    ];

    protected $casts = [
        'amount'              => 'decimal:2',
        'expected_interest'   => 'decimal:2',
        'amount_remaining'    => 'decimal:2',
        'interest_rate'       => 'decimal:2',
        'total_with_interest' => 'decimal:2',
        'start_date'          => 'datetime',
        'due_date'            => 'datetime',
        'disbursed_at'        => 'datetime',
    ];

    /* ───────────────────────────────
     | 🔗 RELATIONSHIPS
     ─────────────────────────────── */

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function loanSchedules()
    {
        return $this->hasMany(LoanSchedule::class);
    }

    public function guarantors()
    {
        return $this->hasMany(\App\Models\Guarantor::class);
    }

    /* ───────────────────────────────
     | 🧮 CALCULATION HELPERS
     ─────────────────────────────── */

    /** Calculate expected interest */
    public function calculateExpectedInterest(): float
    {
        try {
            $amount = floatval($this->amount ?? 0);
            $term   = intval($this->term_months ?? 0);

            if ($amount <= 0 || $term <= 0) {
                return 0.00;
            }

            $ratios = [
                1 => 1.20,
                2 => 1.31,
                3 => 1.425,
                4 => 1.56,
                5 => 1.67,
                6 => 1.83,
            ];

            $ratio = $ratios[$term] ?? (1 + (($this->interest_rate ?? 20) / 100));

            return round(($amount * $ratio) - $amount, 2);

        } catch (\Throwable $e) {
            Log::error('Interest calculation failed', [
                'loan_id' => $this->id ?? 'unknown',
                'error'   => $e->getMessage(),
            ]);
            return 0.00;
        }
    }

    /** Total repayment amount */
    public function calculateTotalWithInterest(): float
    {
        return round(floatval($this->amount) + $this->calculateExpectedInterest(), 2);
    }

    /* ───────────────────────────────
     | ❌ REMOVED: recalculateSummary()
     | ❌ REMOVED: Auto updates on save
     | WHY? — PaymentController handles all recalculation now.
     ─────────────────────────────── */

    /* ───────────────────────────────
     | STATUS HELPERS
     ─────────────────────────────── */

    public function markAsPaid(): void
    {
        $this->status = 'paid';
        $this->amount_remaining = 0;
        $this->interest_earned = round($this->amount_paid - $this->amount, 2);
        $this->saveQuietly();
    }

    public function markAsActive(): void
    {
        $this->status = 'active';
        $this->saveQuietly();
    }
}