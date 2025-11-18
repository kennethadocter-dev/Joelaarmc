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

        // Summary fields
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

    /**
     * Automatically hash password if not already hashed.
     */
    public function setPasswordAttribute($value)
    {
        if (!empty($value) && !str_starts_with($value, '$2y$')) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }

    /**
     * Relationships
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

    /**
     * ============================
     * 🔥 Loan Summary Refresher
     * ============================
     */
    public function refreshLoanSummary()
    {
        try {
            $loans = $this->loans()->get();

            $this->total_loans = $loans->count();
            $this->active_loans_count = $loans->where('status', 'active')->count();
            $this->total_paid = $this->payments()->sum('amount');
            $this->total_remaining = $loans->sum('remaining_balance');
            $this->last_loan_date = $loans->max('created_at');

            $this->saveQuietly();

            Log::info("Customer loan summary refreshed", [
                'customer_id' => $this->id,
            ]);

        } catch (\Throwable $e) {
            Log::error("refreshLoanSummary failed", [
                'customer_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * ============================
     * 🔥 PERMANENT DELETE METHOD
     * ============================
     */
    public function forceDeleteFully()
    {
        try {
            // Delete guarantors
            $this->guarantors()->delete();

            // Delete loans and dependent data
            foreach ($this->loans()->withTrashed()->get() as $loan) {

                if (method_exists($loan, 'loanSchedules')) {
                    $loan->loanSchedules()->delete();
                    $loan->loanSchedules()->forceDelete();
                }

                $loan->payments()->delete();
                $loan->forceDelete();
            }

            // Finally remove customer
            $this->forceDelete();

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