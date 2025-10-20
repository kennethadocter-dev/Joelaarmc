<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        // Org
        'company_name', 'address', 'phone', 'email',
        'bank_name', 'bank_account_number', 'manager_name', 'manager_title',
        // Loan defaults
        'default_interest_rate', 'default_term_months',
        'default_penalty_rate', 'grace_period_days', 'allow_early_repayment',
    ];

    protected $casts = [
        'default_interest_rate'   => 'decimal:2',
        'default_penalty_rate'    => 'decimal:2',
        'default_term_months'     => 'integer',
        'grace_period_days'       => 'integer',
        'allow_early_repayment'   => 'boolean',
    ];

    public static function singleton(): self
    {
        return static::first() ?? static::create([]);
    }
}