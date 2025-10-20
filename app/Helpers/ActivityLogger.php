<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\ActivityLog;

class ActivityLogger
{
    public static function log(string $action, ?string $description = null): void
    {
        $user = Auth::user();

        // 🧩 Safely extract info even if user is missing
        $userId    = $user ? $user->id : null;
        $userName  = $user ? ($user->name ?? $user->username ?? 'Unknown User') : 'System';
        $userEmail = $user ? ($user->email ?? 'noemail@system.local') : 'system@localhost';

        // ✅ Save in database
        ActivityLog::create([
            'user_id'     => $userId,
            'user_name'   => $userName,
            'email'       => $userEmail,
            'action'      => $action,
            'description' => $description ?? '',
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->header('User-Agent'),
        ]);

        // 🔍 Write to system log for debug
        Log::info("[ActivityLog] {$action} by {$userName}", [
            'user_email' => $userEmail,
            'description' => $description,
            'ip' => request()->ip(),
        ]);
    }
}