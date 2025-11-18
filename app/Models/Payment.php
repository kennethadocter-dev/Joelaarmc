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
        'idempotency_key', // ✅ important for firstOrCreate & duplicate protection
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
        // We're already in namespace App\Models, so User::class resolves correctly.
        return $this->belongsTo(User::class, 'received_by');
    }

    /* ───────────────────────────────
     |  ⚙️ MODEL EVENTS (AUTO UPDATES)
     ─────────────────────────────── */

    protected static function booted()
    {
        // When a payment is created
        static::created(function (Payment $payment) {
            try {
                if ($payment->loan) {
                    $payment->loan->recalculateSummary();
                    Log::info("💰 Payment #{$payment->id} created, Loan #{$payment->loan->id} recalculated");
                }
            } catch (\Throwable $e) {
                Log::error('❌ Payment created hook failed', [
                    'payment_id' => $payment->id,
                    'error'      => $e->getMessage(),
                    'line'       => $e->getLine(),
                    'file'       => $e->getFile(),
                ]);
            }
        });

        // When a payment is updated
        static::updated(function (Payment $payment) {
            try {
                if ($payment->loan) {
                    $payment->loan->recalculateSummary();
                    Log::info("🔄 Payment #{$payment->id} updated, Loan #{$payment->loan->id} recalculated");
                }
            } catch (\Throwable $e) {
                Log::error('❌ Payment updated hook failed', [
                    'payment_id' => $payment->id,
                    'error'      => $e->getMessage(),
                    'line'       => $e->getLine(),
                    'file'       => $e->getFile(),
                ]);
            }
        });

        // When a payment is deleted
        static::deleted(function (Payment $payment) {
            try {
                if ($payment->loan) {
                    $payment->loan->recalculateSummary();
                    Log::info("🗑️ Payment #{$payment->id} deleted, Loan #{$payment->loan->id} recalculated");
                }
            } catch (\Throwable $e) {
                Log::error('❌ Payment deleted hook failed', [
                    'payment_id' => $payment->id,
                    'error'      => $e->getMessage(),
                    'line'       => $e->getLine(),
                    'file'       => $e->getFile(),
                ]);
            }
        });
    }
}