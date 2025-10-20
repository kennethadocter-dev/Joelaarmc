<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AllowSuperAdminForAdminRoutes
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        // 🪄 Temporary debug info — shows in your browser
        if ($user) {
            echo "<pre style='font-size:16px;padding:20px;background:#f4f4f4;border:1px solid #ccc;'>
            👤 AUTH CHECK DEBUG
            ----------------------------
            ID: {$user->id}
            Name: {$user->name}
            Role: {$user->role}
            is_super_admin: " . ($user->is_super_admin ? '✅ true' : '❌ false') . "
            </pre>";
        } else {
            echo "<pre>No authenticated user detected.</pre>";
        }

        // ✅ Allow Admins, Staff, and Superadmins
        if ($user && ($user->can('access-admin') || $user->can('access-superadmin'))) {
            return $next($request);
        }

        // 🚫 Otherwise forbid access
        abort(403, 'Unauthorized access.');
    }
}