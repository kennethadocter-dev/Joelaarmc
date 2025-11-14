<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; // ✅ Must extend this, not Model
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class Customer extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $dates = ['deleted_at'];

    protected $fillable = [
        // 🧍‍♀️ Personal Info
        'full_name',
        'email',
        'phone',
        'gender',
        'marital_status',
        'date_of_birth',
        'id_number',

        // 🏠 Address Info
        'house_no',
        'address',
        'community',
        'location',
        'district',
        'postal_address',

        // 💼 Work & Financial Info
        'workplace',
        'profession',
        'employer',
        'bank',
        'bank_branch',
        'has_bank_loan',
        'bank_monthly_deduction',
        'take_home',

        // 💰 Loan Info
        'loan_amount_requested',
        'loan_purpose',
        'notes',

        // 📊 Summary Fields
        'total_loans',
        'total_paid',
        'total_remaining',
        'active_loans_count',
        'last_loan_date',
        'status',

        // 🔐 Password for authentication
        'password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | 🔒 AUTOMATIC PASSWORD HASHING
    |--------------------------------------------------------------------------
    */
    public function setPasswordAttribute($value)
    {
        if (!empty($value) && !str_starts_with($value, '$2y$')) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 🔗 RELATIONSHIPS
    |--------------------------------------------------------------------------
    */
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function payments()
    {
        return $this->hasManyThrough(Payment::class, Loan::class);
    }

    public function guarantors()
    {
        return $this->hasMany(\App\Models\Guarantor::class);
    }

    /*
    |--------------------------------------------------------------------------
    | 🧮 HELPERS & CALCULATIONS
    |--------------------------------------------------------------------------
    */
    public function getDisplayNameAttribute()
    {
        return $this->full_name ?? $this->email ?? $this->phone ?? 'Unnamed Customer';
    }

    public function calculateTotalLoans(): float
    {
        return round($this->loans()->sum('amount'), 2);
    }

    public function calculateTotalPaid(): float
    {
        return round($this->loans()->sum('amount_paid'), 2);
    }

    public function calculateTotalRemaining(): float
    {
        return round($this->loans()->sum('amount_remaining'), 2);
    }

    public function calculateActiveLoansCount(): int
    {
        return $this->loans()
            ->whereIn('status', ['active', 'overdue', 'pending'])
            ->count();
    }

    public function calculateLastLoanDate()
    {
        return $this->loans()
            ->orderByDesc('created_at')
            ->value('created_at');
    }

    /*
    |--------------------------------------------------------------------------
    | 🔁 REBUILD CUSTOMER LOAN SUMMARY
    |--------------------------------------------------------------------------
    */
    public static function refreshLoanSummary(Customer $customer): void
    {
        try {
            $customer->total_loans = $customer->calculateTotalLoans();
            $customer->total_paid = $customer->calculateTotalPaid();
            $customer->total_remaining = $customer->calculateTotalRemaining();
            $customer->active_loans_count = $customer->calculateActiveLoansCount();
            $customer->last_loan_date = $customer->calculateLastLoanDate();
            $customer->saveQuietly();

            Log::info('👤 Customer totals recalculated', [
                'customer_id' => $customer->id,
                'name' => $customer->display_name,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Failed to refresh customer loan summary', [
                'customer_id' => $customer->id ?? null,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | ⚙️ MODEL EVENTS
    |--------------------------------------------------------------------------
    */
    protected static function booted()
    {
        static::saved(function (Customer $customer) {
            self::refreshLoanSummary($customer);
        });

        static::deleting(function (Customer $customer) {
            foreach ($customer->loans as $loan) {
                $loan->delete();
            }
        });

        static::deleted(function (Customer $customer) {
            Log::info('🗑️ Customer soft-deleted', [
                'customer_id' => $customer->id,
                'name' => $customer->display_name,
                'deleted_at' => $customer->deleted_at,
            ]);
        });

        static::restoring(function (Customer $customer) {
            if ($customer->deleted_at && $customer->deleted_at->lt(Carbon::now()->subDays(30))) {
                Log::warning('⚠️ Attempted restore of expired customer prevented', [
                    'customer_id' => $customer->id,
                    'deleted_at' => $customer->deleted_at,
                ]);
                throw new \Exception("This customer record is too old to restore (deleted over 30 days ago).");
            }
        });

        static::registerLoanHooks();
    }

    /*
    |--------------------------------------------------------------------------
    | 🧠 LISTEN TO RELATED LOAN CHANGES
    |--------------------------------------------------------------------------
    */
    protected static function registerLoanHooks(): void
    {
        Loan::created(fn(Loan $loan) => $loan->customer && self::refreshLoanSummary($loan->customer));
        Loan::updated(fn(Loan $loan) => $loan->customer && self::refreshLoanSummary($loan->customer));
        Loan::deleted(fn(Loan $loan) => $loan->customer && self::refreshLoanSummary($loan->customer));
    }

    /*
    |--------------------------------------------------------------------------
    | 🧹 AUTO-PURGE SCOPE (for scheduled command reference)
    |--------------------------------------------------------------------------
    */
    public function scopeOlderThan30Days($query)
    {
        return $query->onlyTrashed()->where('deleted_at', '<=', Carbon::now()->subDays(30));
    }
}