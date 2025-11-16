<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class Customer extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'gender',
        'marital_status',
        'date_of_birth',
        'id_number',

        // Address
        'house_no',
        'address',
        'community',
        'location',
        'district',
        'postal_address',

        // Work
        'workplace',
        'profession',
        'employer',
        'bank',
        'bank_branch',
        'has_bank_loan',
        'bank_monthly_deduction',
        'take_home',

        // Loan Info
        'loan_amount_requested',
        'loan_purpose',
        'notes',

        // Summary
        'total_loans',
        'total_paid',
        'total_remaining',
        'active_loans_count',
        'last_loan_date',
        'status',

        'password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /* Auto-hash password */
    public function setPasswordAttribute($value)
    {
        if (!empty($value) && !str_starts_with($value, '$2y$')) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }

    /* Relationships */
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

    /* Summary Helpers */
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

    /* Refresh Loan Summary */
    public static function refreshLoanSummary(Customer $customer): void
    {
        try {
            $customer->total_loans = $customer->calculateTotalLoans();
            $customer->total_paid = $customer->calculateTotalPaid();
            $customer->total_remaining = $customer->calculateTotalRemaining();
            $customer->active_loans_count = $customer->calculateActiveLoansCount();
            $customer->last_loan_date = $customer->calculateLastLoanDate();
            $customer->saveQuietly();

        } catch (\Throwable $e) {
            Log::error('Failed to refresh customer summary', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /* ============================
       🔥 PERMANENT DELETE METHOD
       ============================ */
    public function forceDeleteFully()
    {
        try {
            // Delete guarantors
            $this->guarantors()->delete();

            // Delete payments (via loans)
            foreach ($this->loans as $loan) {
                $loan->payments()->delete();
                $loan->delete();
            }

            // Delete the customer permanently
            parent::delete();

            return true;

        } catch (\Throwable $e) {
            Log::error('Force delete failed', [
                'customer_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}