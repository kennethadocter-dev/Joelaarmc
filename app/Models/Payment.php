<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'idempotency_key', // Prevents duplicate payments
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    /* -------------------------------------------
     |  RELATIONSHIPS
     -------------------------------------------- */

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function receivedByUser()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /* -------------------------------------------
     |  IMPORTANT NOTE
     |  ----------------
     |  DO NOT auto-recalculate the loan inside
     |  Payment model events (created, updated,
     |  deleted). Your PaymentController already
     |  applies the updates to the schedules.
     |
     |  Leaving recalculation hooks enabled was
     |  causing payments to be applied TWICE.
     |
     |  So we disable model event recalculations.
     -------------------------------------------- */

    protected static function booted()
    {
        // Leave empty to prevent double-deductions.
        // All recalculation is handled manually inside controllers.
    }
}