<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailFailure extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'recipient',
        'subject',
        'loan_id',
        'error_message',
        'failed_at',
    ];
}