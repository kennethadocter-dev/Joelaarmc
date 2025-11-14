<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SuperadminReadOnly
{
    /**
     * Prevent superadmin from modifying admin resources.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Allow everything if user is NOT superadmin
        if (!$user->is_super_admin && $user->role !== 'superadmin') {
            return $next($request);
        }

        // Allowed methods for superadmin:
        $allowedMethods = ['GET', 'HEAD'];

        if (!in_array($request->method(), $allowedMethods)) {
            return abort(403, 'Superadmin is not allowed to modify this resource.');
        }

        return $next($request);
    }
}