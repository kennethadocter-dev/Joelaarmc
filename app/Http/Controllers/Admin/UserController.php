<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        // 🚫 Restrict access: only Superadmin can manage users
        $this->middleware(function ($request, $next) {
            $user = auth()->user();

            if (!$user || $user->role !== 'superadmin') {
                abort(403, 'Access denied. Only Superadmin can manage system users.');
            }

            return $next($request);
        });
    }

    /**
     * 👑 User management is now centralized under Superadmin routes
     */
    public function index()
    {
        return redirect()
            ->route('superadmin.users.index')
            ->with('info', '👑 User management is available only to the Superadmin.');
    }

    /** ➕ Redirect to Superadmin Create User */
    public function create()
    {
        return redirect()
            ->route('superadmin.users.create')
            ->with('info', '👑 Only the Superadmin can create new users.');
    }

    /**
     * 💾 Store new user — friendly validation for unique fields
     * (only active if this controller is used directly)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'username' => 'nullable|string|max:50|unique:users,username',
                'phone' => 'nullable|string|max:20|unique:users,phone',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|string|in:superadmin,admin,staff',
            ], [
                'email.unique' => 'This email is already in use.',
                'username.unique' => 'This username is already taken.',
                'phone.unique' => 'This phone number is already registered.',
            ]);

            $validated['password'] = Hash::make($validated['password']);
            User::create($validated);

            return redirect()
                ->route('superadmin.users.index')
                ->with('success', '✅ User created successfully!');
        } catch (\Throwable $e) {
            return $this->handleError($e, '❌ Failed to create user.');
        }
    }

    /** ✏️ Prevent non-superadmin editing */
    public function edit()
    {
        return redirect()
            ->route('superadmin.users.index')
            ->with('error', '❌ Admin and staff cannot edit users.');
    }

    /**
     * 💾 Update user info (safe with unique checks)
     */
    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
                'username' => 'nullable|string|max:50|unique:users,username,' . $user->id,
                'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->id,
                'role' => 'required|string|in:superadmin,admin,staff',
            ], [
                'email.unique' => 'This email is already in use.',
                'username.unique' => 'This username is already taken.',
                'phone.unique' => 'This phone number is already registered.',
            ]);

            $user->update($validated);

            return redirect()
                ->route('superadmin.users.index')
                ->with('success', '✅ User updated successfully!');
        } catch (\Throwable $e) {
            return $this->handleError($e, '❌ Failed to update user.');
        }
    }

    /** 🗑️ Delete user (restricted) */
    public function destroy(User $user)
    {
        try {
            if ($user->role === 'superadmin') {
                return back()->with('error', '❌ You cannot delete the Superadmin account.');
            }

            $user->delete();

            return redirect()
                ->route('superadmin.users.index')
                ->with('success', '✅ User deleted successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '❌ Failed to delete user.');
        }
    }

    /** 🔁 Prevent resend of credentials */
    public function resendCredentials()
    {
        return redirect()
            ->route('superadmin.users.index')
            ->with('error', '❌ Only the Superadmin can resend login credentials.');
    }

    /** ⚙️ Centralized error handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ Admin\\UserController Error', [
            'user'  => auth()->user()?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()
            ->route('superadmin.users.index')
            ->with('error', $message);
    }
}