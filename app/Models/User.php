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
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'is_super_admin', // ✅ flag for special superadmin
        'username',       // ✅ newly added for unique portal URLs
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be type-cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_super_admin'    => 'boolean',
        ];
    }

    /**
     * ✅ Automatically generate a username when creating a user
     * (e.g. adm-john-582, cli-jane-203)
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

                $base = Str::slug($user->name ?: 'user');
                $user->username = "{$prefix}-{$base}-" . rand(100, 999);
            }
        });
    }

    /**
     * ✅ Helper: Check if this user is a Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin'
            || $this->is_super_admin
            || $this->email === 'super@admin.com';
    }

    /**
     * ✅ Relationships
     */

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