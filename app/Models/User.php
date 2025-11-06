<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'is_super_admin', // ✅ Flag for top-level access
        'username',       // ✅ Unique login/profile handle
    ];

    /**
     * The attributes that should be hidden for arrays / JSON.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be type-cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_super_admin'    => 'boolean',
    ];

    /**
     * Automatically hash passwords.
     */
    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn($value) => !empty($value) ? bcrypt($value) : null
        );
    }

    /**
     * ✅ Automatically generate a username when creating a user.
     * Example: sup-john-doe-582, adm-jane-203
     */
    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->username)) {
                $prefix = match ($user->role) {
                    'superadmin' => 'sup',
                    'admin'      => 'adm',
                    'staff'      => 'stf',
                    'user'       => 'cli',
                    default      => 'usr',
                };

                $base = Str::slug(strtolower($user->name ?: 'user'));
                $user->username = "{$prefix}-{$base}-" . rand(100, 999);
            }
        });
    }

    /* ===========================================================
       🔑 ROLE HELPERS
       =========================================================== */

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin'
            || $this->is_super_admin
            || $this->email === 'super@admin.com';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'superadmin']);
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    /* ===========================================================
       🤝 RELATIONSHIPS
       =========================================================== */

    // A user can create many loans
    public function loans()
    {
        return $this->hasMany(Loan::class, 'user_id');
    }

    // A user can receive many payments
    public function payments()
    {
        return $this->hasMany(Payment::class, 'received_by');
    }
}