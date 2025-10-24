<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(Request $request): Response
    {
        // 🧠 Detect which route triggered this page
        $routeName = $request->route()->getName();

        $role = match (true) {
            str_contains($routeName, 'superadmin') => 'superadmin',
            str_contains($routeName, 'admin')      => 'admin',
            str_contains($routeName, 'customer')   => 'customer',
            default                                => 'user',
        };

        // 🏷️ Dynamic title per role
        $pageTitle = match ($role) {
            'superadmin' => 'Reset Superadmin Password',
            'admin'      => 'Reset Admin/Staff Password',
            'customer'   => 'Reset Customer Password',
            default      => 'Reset Password',
        };

        return Inertia::render('Auth/ForgotPassword', [
            'status'     => session('status'),
            'role'       => $role,
            'pageTitle'  => $pageTitle,
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // 🧠 Detect the role again from route name
        $routeName = $request->route()->getName();
        $role = match (true) {
            str_contains($routeName, 'superadmin') => 'superadmin',
            str_contains($routeName, 'admin')      => 'admin',
            str_contains($routeName, 'customer')   => 'customer',
            default                                => 'user',
        };

        // 📨 Choose a different broker (configure these in config/auth.php)
        $broker = match ($role) {
            'superadmin' => 'superadmins',
            'admin'      => 'admins',
            'customer'   => 'customers',
            default      => 'users',
        };

        $status = Password::broker($broker)->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}