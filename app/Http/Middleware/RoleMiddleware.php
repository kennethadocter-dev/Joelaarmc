<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Example usages:
     *   ->middleware('role:superadmin')
     *   ->middleware('role:admin,staff')
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = Auth::guard('web')->user();

        // If user is not logged in on internal guard → redirect to login
        if (!$user) {
            return redirect()->route('login');
        }

        $userRole = strtolower($user->role ?? '');

        // Superadmin always allowed
        if ($user->is_super_admin || $userRole === 'superadmin') {
            return $next($request);
        }

        // Normalize role names
        $roles = array_map('strtolower', $roles);

        // Reject if user's role not in allowed roles
        if (!in_array($userRole, $roles)) {
            abort(403, "Unauthorized: You don't have permission to access this area.");
        }

        return $next($request);
    }
}