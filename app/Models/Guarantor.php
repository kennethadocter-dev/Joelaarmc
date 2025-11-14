<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guarantor extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'customer_id',
        'name',
        'occupation',
        'residence',
        'contact',
        'email',
    ];

    /**
     * 🏦 Belongs to a specific loan
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * 👤 Belongs to a specific customer (optional)
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}