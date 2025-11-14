<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * 🧭 Display the user's profile form (works for both guards)
     */
    public function edit(Request $request): Response
    {
        $guard = Auth::guard('customer')->check() ? 'customer' : 'web';
        $user = Auth::guard($guard)->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => $user,
                'guard' => $guard,
            ],
        ]);
    }

    /**
     * ✏️ Update the user's profile or password information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $guard = Auth::guard('customer')->check() ? 'customer' : 'web';
        $user = Auth::guard($guard)->user();

        $validated = $request->validated();

        // 🧩 If password fields are present, handle password update
        if ($request->filled('password')) {
            // Check current password before changing (for safety)
            if (!Hash::check($request->input('current_password'), $user->password)) {
                return Redirect::back()->withErrors([
                    'current_password' => 'The current password you entered is incorrect.',
                ]);
            }

            // Update password
            $user->password = Hash::make($request->input('password'));
            $user->save();

            return Redirect::back()->with('status', 'password-updated');
        }

        // Otherwise update profile fields (name/email)
        $user->fill($validated);

        if ($user->isDirty('email') && $user instanceof MustVerifyEmail) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::back()->with('status', 'profile-updated');
    }

    /**
     * 🚪 Delete the user's account (works for both guards)
     */
    public function destroy(Request $request): RedirectResponse
    {
        $guard = Auth::guard('customer')->check() ? 'customer' : 'web';
        $user = Auth::guard($guard)->user();

        $request->validate([
            'password' => ['required'],
        ]);

        // Manually verify password since current_password rule only works on default guard
        if (!Hash::check($request->password, $user->password)) {
            return Redirect::back()->withErrors([
                'password' => 'The password you entered is incorrect.',
            ]);
        }

        // Delete account + logout properly
        $user->delete();
        Auth::guard($guard)->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::route('login');
    }
}
