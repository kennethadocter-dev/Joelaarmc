<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'loan_id',
        'amount',
        'paid_at',
        'reference',
        'note',
        'received_by',        // ✅ fixed name
        'payment_method',     // ✅ new
        'processor',          // ✅ optional for gateway name
        'meta',               // ✅ optional gateway data
    ];

    protected $casts = [
        'paid_at' => 'date',
        'amount'  => 'decimal:2',
        'meta'    => 'array', // ✅ safe for future integration
    ];

    /**
     * 🔗 The loan this payment belongs to.
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * 👤 The user who received the payment.
     */
    public function receivedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}