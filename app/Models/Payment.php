<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'amount',
        'paid_at',
        'received_by',
        'payment_method',
        'note',
        'reference',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    /* ───────────────────────────────
     |  🔗 RELATIONSHIPS
     ─────────────────────────────── */

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function receivedByUser()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /* ───────────────────────────────
     |  ⚙️ AUTO-UPDATE HOOKS
     ─────────────────────────────── */

    protected static function booted()
    {
        /**
         * 🔁 When a new payment is created
         */
        static::created(function (Payment $payment) {
            try {
                $loan = $payment->loan;
                if (!$loan) return;

                // 🔄 Update payment totals
                $loan->amount_paid = $loan->payments()->sum('amount');
                $loan->amount_remaining = max(0, $loan->total_with_interest - $loan->amount_paid);

                // 🔁 Update status logic
                if ($loan->amount_remaining <= 0.01) {
                    $loan->status = 'paid';
                    $loan->interest_earned = round($loan->amount_paid - $loan->amount, 2);
                } elseif ($loan->due_date && $loan->due_date->isPast() && $loan->status !== 'paid') {
                    $loan->status = 'overdue';
                } else {
                    $loan->status = 'active';
                }

                // ✅ Force-save loan to persist updates
                $loan->save();

                // 🔁 Sync customer totals
                if ($loan->customer) {
                    $loan->customer->update([
                        'total_loans' => $loan->customer->loans()->sum('amount'),
                        'total_paid' => $loan->customer->loans()->sum('amount_paid'),
                        'total_remaining' => $loan->customer->loans()->sum('amount_remaining'),
                        'active_loans_count' => $loan->customer->loans()
                            ->whereIn('status', ['active', 'overdue', 'pending'])
                            ->count(),
                    ]);
                }

                Log::info("💰 Payment #{$payment->id} applied to Loan #{$loan->id}, new status: {$loan->status}");

            } catch (\Throwable $e) {
                Log::error('❌ Payment auto-update failed', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile(),
                ]);
            }
        });

        /**
         * 🔁 When a payment is updated
         */
        static::updated(function (Payment $payment) {
            try {
                $loan = $payment->loan;
                if (!$loan) return;

                $loan->amount_paid = $loan->payments()->sum('amount');
                $loan->amount_remaining = max(0, $loan->total_with_interest - $loan->amount_paid);

                if ($loan->amount_remaining <= 0.01) {
                    $loan->status = 'paid';
                    $loan->interest_earned = round($loan->amount_paid - $loan->amount, 2);
                } elseif ($loan->due_date && $loan->due_date->isPast()) {
                    $loan->status = 'overdue';
                } else {
                    $loan->status = 'active';
                }

                $loan->save();

                Log::info("🔄 Payment #{$payment->id} updated Loan #{$loan->id}");

            } catch (\Throwable $e) {
                Log::error('❌ Payment update sync failed', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        });

        /**
         * 🔁 When a payment is deleted
         */
        static::deleted(function (Payment $payment) {
            try {
                $loan = $payment->loan;
                if (!$loan) return;

                $loan->amount_paid = $loan->payments()->sum('amount');
                $loan->amount_remaining = max(0, $loan->total_with_interest - $loan->amount_paid);

                if ($loan->amount_remaining <= 0.01) {
                    $loan->status = 'paid';
                    $loan->interest_earned = round($loan->amount_paid - $loan->amount, 2);
                } elseif ($loan->due_date && $loan->due_date->isPast()) {
                    $loan->status = 'overdue';
                } else {
                    $loan->status = 'active';
                }

                $loan->save();

                Log::info("🗑️ Payment #{$payment->id} deleted, Loan #{$loan->id} recalculated");

            } catch (\Throwable $e) {
                Log::error('❌ Payment delete sync failed', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }
}