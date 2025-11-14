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
        // Optional relationship – safe even if there are no guarantors
        return $this->hasMany(\App\Models\Guarantor::class);
    }

    /* ───────────────────────────────
     | 🧮 CALCULATION HELPERS
     ─────────────────────────────── */

    /** 💡 Calculates expected interest safely */
    public function calculateExpectedInterest(): float
    {
        try {
            $amount = floatval($this->amount ?? 0);
            $term   = intval($this->term_months ?? 0);

            if ($amount <= 0 || $term <= 0) {
                return 0.00;
            }

            // Base ratios by term (months)
            $ratios = [
                1 => 1.20,   // 20%
                2 => 1.31,   // 31%
                3 => 1.425,  // 42.5%
                4 => 1.56,   // 56%
                5 => 1.67,   // 67%
                6 => 1.83,   // 83%
            ];

            // Use month ratio if defined, else fallback to interest_rate (default 20%)
            $ratio = $ratios[$term] ?? (1 + (($this->interest_rate ?? 20) / 100));

            return round(($amount * $ratio) - $amount, 2);

        } catch (\Throwable $e) {
            Log::error('❌ Failed to calculate expected interest', [
                'loan_id' => $this->id ?? 'unknown',
                'error'   => $e->getMessage(),
            ]);
            return 0.00;
        }
    }

    /** 💰 Calculates total with interest */
    public function calculateTotalWithInterest(): float
    {
        $amount = floatval($this->amount ?? 0);
        return round($amount + $this->calculateExpectedInterest(), 2);
    }

    /** 🔄 Recalculate and sync all summary fields */
    public function recalculateSummary(): void
    {
        try {
            $this->amount_paid        = $this->payments()->sum('amount');
            $this->expected_interest  = $this->calculateExpectedInterest();
            $this->total_with_interest = $this->calculateTotalWithInterest();

            // Remaining balance
            $remaining = round($this->total_with_interest - $this->amount_paid, 2);
            $this->amount_remaining = max($remaining, 0);

            // Status logic
            if ($this->amount_remaining <= 0.01) {
                $this->status = 'paid';
                $this->interest_earned = round($this->amount_paid - $this->amount, 2);
            } elseif ($this->due_date && Carbon::parse($this->due_date)->isPast() && $this->status !== 'paid') {
                $this->status = 'overdue';
            } else {
                $this->status = 'active';
            }

            $this->saveQuietly();

            // Customer totals sync
            if ($this->customer) {
                $this->customer->total_loans = $this->customer->loans()->sum('amount');
                $this->customer->total_paid = $this->customer->loans()->sum('amount_paid');
                $this->customer->total_remaining = $this->customer->loans()->sum('amount_remaining');
                $this->customer->active_loans_count = $this->customer->loans()
                    ->whereIn('status', ['active', 'overdue', 'pending'])
                    ->count();
                $this->customer->saveQuietly();
            }

        } catch (\Throwable $e) {
            Log::error('❌ Loan recalculation failed', [
                'loan_id' => $this->id ?? 'unknown',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ]);
        }
    }

    /* ───────────────────────────────
     | ✅ STATUS HELPERS
     ─────────────────────────────── */

    /** Marks loan as fully paid */
    public function markAsPaid(): void
    {
        $this->status = 'paid';
        $this->amount_remaining = 0;
        $this->interest_earned = round($this->amount_paid - $this->amount, 2);
        $this->expected_interest = 0.00;
        $this->saveQuietly();
    }

    /** Marks loan as active again (after partial payment) */
    public function markAsActive(): void
    {
        $this->status = 'active';
        $this->saveQuietly();
    }

    /* ───────────────────────────────
     | ⚙️ MODEL EVENTS (AUTO UPDATES)
     ─────────────────────────────── */
    protected static function booted()
    {
        // 🔹 Before saving
        static::saving(function (Loan $loan) {
            // Default interest rate 20% if missing
            if (empty($loan->interest_rate)) {
                $loan->interest_rate = 20;
            }

            $loan->status = strtolower(trim($loan->status ?? 'active'));

            // Ensure expected interest & totals
            if ($loan->amount > 0) {
                if (empty($loan->expected_interest) || $loan->expected_interest <= 0) {
                    $loan->expected_interest = $loan->calculateExpectedInterest();
                }

                if (empty($loan->total_with_interest) || $loan->total_with_interest <= 0) {
                    $loan->total_with_interest = $loan->calculateTotalWithInterest();
                }
            }

            // Default remaining amount
            if ($loan->status === 'paid') {
                $loan->amount_remaining = 0;
            } elseif (is_null($loan->amount_remaining) || $loan->amount_remaining <= 0) {
                $loan->amount_remaining = $loan->total_with_interest - ($loan->amount_paid ?? 0);
            }
        });

        // 🔹 After delete — refresh customer stats
        static::deleted(function (Loan $loan) {
            if ($loan->customer) {
                $loan->customer->total_loans = $loan->customer->loans()->sum('amount');
                $loan->customer->total_paid = $loan->customer->loans()->sum('amount_paid');
                $loan->customer->total_remaining = $loan->customer->loans()->sum('amount_remaining');
                $loan->customer->active_loans_count = $loan->customer->loans()
                    ->whereIn('status', ['active', 'overdue', 'pending'])
                    ->count();
                $loan->customer->saveQuietly();
            }
        });
    }
}