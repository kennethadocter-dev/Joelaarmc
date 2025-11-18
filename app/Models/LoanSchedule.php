<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
     |  🔗 RELATIONSHIP
     ─────────────────────────────── */
    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    /* ───────────────────────────────
     |  ❌ DISABLED AUTO-UPDATE HOOKS
     |  -----------------------------
     |  PaymentController handles all
     |  recalculations to avoid DOUBLE
     |  deductions and double summaries.
     ─────────────────────────────── */
    protected static function booted()
    {
        // Intentionally left EMPTY
        // No auto recalculation here
    }

    /* ───────────────────────────────
     |  ✔️ SIMPLE HELPER
     ─────────────────────────────── */
    public function markAsPaid(float $amount = null): void
    {
        $amountToApply = $amount ?? ($this->amount - $this->amount_paid);

        $this->amount_paid += $amountToApply;
        $this->amount_left = max(0, $this->amount - $this->amount_paid);
        $this->is_paid     = $this->amount_left <= 0.01;

        $this->save();
    }
}