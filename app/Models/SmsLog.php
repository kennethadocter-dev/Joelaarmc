<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    use HasFactory;

    /**
     * 🧾 Table associated with the model
     */
    protected $table = 'sms_logs';

    /**
     * ✅ Allow mass assignment for these columns
     */
    protected $fillable = [
        'phone',
        'message',
        'status',
        'error',
    ];

    /**
     * 🔍 Simple helper to format status with emoji
     */
    public function getStatusIconAttribute(): string
    {
        return match ($this->status) {
            'sent'   => '✅ Sent',
            'queued' => '⏳ Queued',
            'failed' => '❌ Failed',
            default  => ucfirst($this->status ?? 'unknown'),
        };
    }
}