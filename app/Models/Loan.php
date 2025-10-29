<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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
    ];

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

    if ($this->amount_remaining <= 0) {
        $this->status = 'paid';
    } elseif ($this->status === 'pending') {
        $this->status = 'active';
    }

    $this->save();
}

    /** 💰 Total amount due (principal + interest) */
    public function getTotalDueAttribute(): float
    {
        $amount = (float) ($this->amount ?? 0);
        $interestRate = (float) ($this->interest_rate ?? 0);

        return $amount + ($amount * $interestRate / 100);
    }

    /** 📆 Monthly installment value */
    public function getMonthlyInstallmentAttribute(): float
    {
        return $this->term_months > 0
            ? round($this->total_due / $this->term_months, 2)
            : 0;
    }
}