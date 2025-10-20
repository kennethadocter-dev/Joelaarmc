<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Customer extends Model
{
    // ✅ Mass assignable fields (added 'address')
    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'marital_status',
        'gender',
        'house_no',
        'address', // ✅ Added
        'community',
        'location',
        'district',
        'postal_address',
        'workplace',
        'profession',
        'employer',
        'bank',
        'bank_branch',
        'has_bank_loan',
        'bank_monthly_deduction',
        'take_home',
        'loan_amount_requested',
        'loan_purpose',
        'agreement_path',
        'status',
    ];

    // ✅ Type casting for numeric and boolean fields
    protected $casts = [
        'has_bank_loan'          => 'boolean',
        'bank_monthly_deduction' => 'decimal:2',
        'take_home'              => 'decimal:2',
        'loan_amount_requested'  => 'decimal:2',
    ];

    /** 📑 A customer can have many guarantors */
    public function guarantors(): HasMany
    {
        return $this->hasMany(Guarantor::class, 'customer_id');
    }

    /** 💸 A customer can have many loans */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'customer_id');
    }

    /** 🌐 Get public URL for agreement file (if exists) */
    protected function agreementUrl(): Attribute
    {
        return Attribute::get(fn () =>
            $this->agreement_path
                ? asset('storage/' . $this->agreement_path)
                : null
        );
    }

    /** ✅ Check if customer currently has an active, pending, or overdue loan */
    public function hasActiveLoan(): bool
    {
        return $this->loans()
            ->whereIn('status', ['pending', 'active', 'overdue'])
            ->exists();
    }

    /** ✅ Get the latest loan associated with this customer */
    public function latestLoan()
    {
        return $this->loans()->latest('created_at')->first();
    }

    /** 🧹 Auto-format full name before saving (capitalize & trim) */
    protected static function booted(): void
    {
        static::saving(function ($customer) {
            if (!empty($customer->full_name)) {
                $customer->full_name = ucwords(trim($customer->full_name));
            }
        });
    }
}