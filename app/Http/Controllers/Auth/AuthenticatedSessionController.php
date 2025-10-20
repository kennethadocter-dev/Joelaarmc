<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        // 🔒 If already logged in, redirect to correct dashboard
        if (auth()->check()) {
            $user = auth()->user();

            if ($user->is_super_admin || $user->role === 'superadmin') {
                return redirect()->route('superadmin.dashboard');
            }

            if (in_array($user->role, ['admin', 'staff'])) {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('user.dashboard', [
                'username' => $user->username ?? $user->id,
            ]);
        }

        // 🧭 Normal login page
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // 🚀 Redirect based on role immediately after login
        if ($user->is_super_admin || $user->role === 'superadmin') {
            return redirect()->route('superadmin.dashboard');
        }

        if (in_array($user->role, ['admin', 'staff'])) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('user.dashboard', [
            'username' => $user->username ?? $user->id,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}