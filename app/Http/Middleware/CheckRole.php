<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handles role-based access.
     * 
     * Supports inheritance:
     * - superadmin can access ANY admin route
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized.');
        }

        $userRole = $user->role;

        // 🌟 Superadmin inherits access to ANY role
        if ($userRole === 'superadmin') {
            return $next($request); 
        }

        // Normal role check
        if (!in_array($userRole, $roles)) {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}