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
     * 🔁 Recalculate totals and update loan status.
     * Can be safely called after any payment or schedule update.
     */
    public function recalcStatusAndSave(): void
    {
        // Get sums directly from the database for accuracy
        $totals = DB::table('loan_schedules')
            ->selectRaw('SUM(amount_paid) as total_paid, SUM(amount_left) as total_left')
            ->where('loan_id', $this->id)
            ->first();

        $this->amount_paid = (float) ($totals->total_paid ?? 0);
        $this->amount_remaining = (float) ($totals->total_left ?? 0);

        // Prevent negative remainder
        if ($this->amount_remaining < 0) {
            $this->amount_remaining = 0;
        }

        // Update interest earned dynamically
        $this->interest_earned = max(0, $this->amount_paid - $this->amount);

        // Determine loan status
        if ($this->amount_remaining <= 0.01) {
            $this->status = 'paid';
        } else {
            $dueDate = $this->due_date
                ? Carbon::parse($this->due_date)
                : ($this->start_date
                    ? Carbon::parse($this->start_date)->addMonths((int) $this->term_months)
                    : null);

            if ($dueDate && now()->greaterThan($dueDate) && $this->status !== 'paid') {
                $this->status = 'overdue';
            } elseif ($this->status === 'pending') {
                // stays pending until activated
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