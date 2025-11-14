<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    /**
     * ---------------------------------------------------------
     * SHOW LOGIN PAGE
     * ---------------------------------------------------------
     * If user is logged in → redirect safely.
     * If not → show login page (no redirects).
     */
    public function create()
    {
        // INTERNAL USERS (superadmin, admin, staff)
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();

            if ($user->is_super_admin || $user->role === 'superadmin') {
                return redirect()->route('superadmin.dashboard');
            }

            return redirect()->route('admin.dashboard');
        }

        // ALWAYS SHOW LOGIN FOR NON-AUTH USERS
        return Inertia::render('Auth/Login', [
            'canResetPassword' => false,
            'status' => session('status'),
        ]);
    }


    /**
     * ---------------------------------------------------------
     * LOGIN HANDLER
     * ---------------------------------------------------------
     * Supports staff login by username or email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'login'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginInput = $request->input('login');
        $password   = $request->input('password');

        /**
         * INTERNAL USERS LOGIN
         */
        if (filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            $credentials = ['email' => $loginInput, 'password' => $password];
        } else {
            // Change "username" to "name" if that’s what your users table uses.
            $credentials = ['name' => $loginInput, 'password' => $password];
        }

        if (Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::guard('web')->user();

            if ($user->is_super_admin || $user->role === 'superadmin') {
                return redirect()->intended(route('superadmin.dashboard'));
            }

            return redirect()->intended(route('admin.dashboard'));
        }


        /**
         * CUSTOMER LOGIN (DISABLED TO AVOID LOGIN LOOP CONFLICTS)
         *
         * Enable only when customer portal is active.
         *
         * Example:
         *
         * $customer = Customer::where('email', $loginInput)
         *                    ->orWhere('phone', $loginInput)
         *                    ->first();
         *
         * if ($customer && Hash::check($password, $customer->password)) {
         *     Auth::guard('customer')->login($customer);
         *     $request->session()->regenerate();
         *     return redirect('/customer/dashboard');
         * }
         */


        /**
         * INVALID LOGIN
         */
        return back()->withErrors([
            'login' => 'Invalid username/email or password.',
        ]);
    }


    /**
     * ---------------------------------------------------------
     * LOGOUT HANDLER
     * ---------------------------------------------------------
     * Clears both guards + regenerates token.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Logout internal staff/admin/superadmin
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
        }

        // Logout customers (if active)
        if (Auth::guard('customer')->check()) {
            Auth::guard('customer')->logout();
        }

        // Destroy session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}