<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'payment_number',
        'amount',
        'due_date',
        'is_paid',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'datetime:Y-m-d',
        'is_paid' => 'boolean',
    ];

    /** 🔗 Each schedule belongs to a Loan */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }
}