<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Loan extends Model
{
    protected $fillable = [
        'user_id',
        'customer_id',
        'client_name',
        'amount',
        'interest_rate',
        'term_months',
        'start_date',
        'due_date',
        'status',
        'amount_paid',
        'amount_remaining',
        'notes',
        'disbursed_at',
        'interest_earned',
        'total_with_interest', // ✅ added for controller consistency
    ];

    protected $casts = [
        'start_date'        => 'datetime:Y-m-d',
        'due_date'          => 'datetime:Y-m-d',
        'disbursed_at'      => 'datetime:Y-m-d',
        'amount'            => 'decimal:2',
        'interest_rate'     => 'decimal:2',
        'amount_paid'       => 'decimal:2',
        'amount_remaining'  => 'decimal:2',
        'interest_earned'   => 'decimal:2',
        'total_with_interest' => 'decimal:2',
    ];

    /* =======================================================
       🔗 RELATIONSHIPS
       ======================================================= */

    /** 👤 Staff member who created the loan */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** 🧍 Customer linked to the loan */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /** 💳 All payments linked to the loan */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'loan_id')->orderBy('paid_at', 'desc');
    }

    /** 👥 All guarantors linked to this loan */
    public function guarantors(): HasMany
    {
        return $this->hasMany(Guarantor::class, 'loan_id');
    }

    /** 📅 All monthly payment schedules for this loan */
    public function loanSchedules(): HasMany
    {
        return $this->hasMany(LoanSchedule::class, 'loan_id')->orderBy('payment_number');
    }

    /* =======================================================
       ⚙️ CORE LOGIC
       ======================================================= */

    /**
     * 🔁 Recalculate totals and update loan status accurately.
     * Ensures new loans start as pending/active and only become "paid" when fully cleared.
     */
    public function recalcStatusAndSave(): void
    {
        $totalPaid = $this->loanSchedules()->sum('amount_paid');
        $totalLeft = $this->loanSchedules()->sum('amount_left');

        // 🧮 Normalize small rounding issues (e.g., 0.009 ≈ 0)
        if ($totalLeft < 0.05) {
            $totalLeft = 0;
        }

        $this->amount_paid = round($totalPaid, 2);
        $this->amount_remaining = round($totalLeft, 2);

        // ✅ Use consistent rules
        if ($this->amount_remaining <= 0) {
            $this->status = 'paid';
        } elseif (in_array($this->status, ['pending', 'draft'])) {
            $this->status = 'active';
        }

        $this->save();
    }

    /* =======================================================
       🧮 COMPUTED ATTRIBUTES
       ======================================================= */

    /** 💰 Total amount due (principal + interest) */
    public function getTotalDueAttribute(): float
    {
        if ($this->total_with_interest) {
            return (float) $this->total_with_interest;
        }

        $amount = (float) ($this->amount ?? 0);
        $interestEarned = (float) ($this->interest_earned ?? 0);

        return round($amount + $interestEarned, 2);
    }

    /** 📆 Monthly installment value */
    public function getMonthlyInstallmentAttribute(): float
    {
        return $this->term_months > 0
            ? round($this->total_due / $this->term_months, 2)
            : 0.00;
    }

    /** 💵 Percentage progress of payment */
    public function getProgressAttribute(): float
    {
        $total = $this->total_due > 0 ? $this->total_due : 1;
        return round(($this->amount_paid / $total) * 100, 1);
    }

    /** 📊 Human-readable loan status label */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => '⏳ Pending',
            'active'  => '🟢 Active',
            'paid'    => '✅ Paid',
            'overdue' => '🔴 Overdue',
            default   => ucfirst($this->status ?? 'Unknown'),
        };
    }

    /** 📅 Time left or overdue info */
    public function getDaysUntilDueAttribute(): ?string
    {
        if (!$this->due_date) return null;
        $days = now()->diffInDays(Carbon::parse($this->due_date), false);
        return $days >= 0 ? "{$days} days left" : abs($days) . " days overdue";
    }
}