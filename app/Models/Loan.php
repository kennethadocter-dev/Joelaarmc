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

    /** 👤 The staff user who created the loan */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** 🧍‍♂️ Customer associated with this loan */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /** 💳 All payments linked to this loan */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'loan_id')->orderBy('paid_at', 'desc');
    }

    /** 👥 All guarantors linked to this loan */
    public function guarantors(): HasMany
    {
        return $this->hasMany(Guarantor::class, 'loan_id');
    }

    /** 📅 All payment schedules linked to this loan */
    public function loanSchedules(): HasMany
    {
        return $this->hasMany(LoanSchedule::class, 'loan_id');
    }

    /**
     * 🔁 Recalculate and update loan status based on payments & due date
     */
    public function recalcStatusAndSave(): void
    {
        $this->amount_paid = (float) ($this->amount_paid ?? 0);
        $this->amount_remaining = (float) ($this->amount_remaining ?? 0);

        if ($this->amount_remaining < 0) {
            $this->amount_remaining = 0;
        }

        if ($this->amount_remaining <= 0) {
            $this->status = 'paid';
            $this->amount_remaining = 0;
            $this->interest_earned = max(0, $this->amount_paid - $this->amount);
        } else {
            $dueDate = $this->due_date
                ? Carbon::parse($this->due_date)
                : ($this->start_date
                    ? Carbon::parse($this->start_date)->addMonths((int) $this->term_months)
                    : null);

            if ($dueDate && now()->greaterThan($dueDate) && $this->status !== 'paid') {
                $this->status = 'overdue';
            } elseif ($this->status === 'pending') {
                // stays pending until manually activated
            } else {
                $this->status = 'active';
            }
        }

        $this->save();

        // 👤 If loan fully paid, deactivate customer (if no other active loans)
        if ($this->status === 'paid' && $this->customer) {
            $hasOtherActive = $this->customer->loans()
                ->whereIn('status', ['active', 'pending', 'overdue'])
                ->exists();

            if (! $hasOtherActive) {
                $this->customer->status = 'inactive';
                $this->customer->save();
            }
        }
    }

    /** 💰 Total loan amount + interest */
    public function getTotalDueAttribute(): float
    {
        $amount = (float) ($this->amount ?? 0);
        $interestRate = (float) ($this->interest_rate ?? 0);

        return $amount + ($amount * $interestRate / 100);
    }

    /** 📆 Monthly installment amount */
    public function getMonthlyInstallmentAttribute(): float
    {
        return $this->term_months > 0
            ? $this->total_due / $this->term_months
            : 0;
    }
}