<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Mail\AccountCreatedMail;
use App\Helpers\SmsNotifier;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct()
    {
        // ✅ Allow only admin roles to access user management
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!in_array($user->role, ['admin', 'superadmin'])) {
                abort(403, 'Access denied. Only administrators can manage users.');
            }
            return $next($request);
        });
    }

    /** 🔁 Redirect path based on user role */
    private function redirectToIndex()
    {
        $user = auth()->user();
        return $user && $user->role === 'superadmin'
            ? 'superadmin.users.index'
            : 'admin.users.index';
    }

    /** 📋 List all users */
    public function index(Request $request)
    {
        try {
            $q = trim((string)$request->get('q', ''));
            $roleFilter = $request->get('role', '');

            $users = User::query()
                ->select('id', 'name', 'email', 'phone', 'role', 'created_at')
                ->when($q, function ($query) use ($q) {
                    $query->where(function ($sub) use ($q) {
                        $sub->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%");
                    });
                })
                ->when($roleFilter, fn($query) => $query->where('role', $roleFilter))
                ->orderByRaw("
                    CASE
                        WHEN role = 'superadmin' THEN 1
                        WHEN role = 'admin' THEN 2
                        WHEN role = 'staff' THEN 3
                        WHEN role = 'user' THEN 4
                        ELSE 5
                    END
                ")
                ->orderBy('name')
                ->get();

            $counts = [
                'super_admin' => User::where('role', 'superadmin')->count(),
                'admin'       => User::where('role', 'admin')->count(),
                'staff'       => User::where('role', 'staff')->count(),
                'user'        => User::where('role', 'user')->count(),
            ];

            return Inertia::render('Users/Index', [
                'users'   => $users,
                'counts'  => $counts,
                'filters' => ['q' => $q, 'role' => $roleFilter],
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load users list.');
        }
    }

    /** ➕ Create user form */
    public function create()
    {
        try {
            return Inertia::render('Users/Create');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to open user creation form.');
        }
    }

    /** 💾 Store new user + notify */
    public function store(Request $request)
    {
        try {
            $current = auth()->user();

            // ✅ Allow superadmin to create any role
            $allowedRoles = $current->role === 'superadmin'
                ? ['superadmin', 'admin', 'staff', 'user']
                : ['staff', 'user'];

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'nullable|email|unique:users,email',
                'phone'    => ['nullable', 'regex:/^(0|233)\d{9}$/'],
                'role'     => 'required|in:' . implode(',', $allowedRoles),
                'password' => 'nullable|string|min:6|confirmed',
            ]);

            $plainPassword = $validated['password'] ?? Str::random(8);
            $validated['password'] = bcrypt($plainPassword);

            // ☎️ Normalize Ghana phone number
            if (!empty($validated['phone'])) {
                $phone = preg_replace('/\D/', '', $validated['phone']);
                if (str_starts_with($phone, '0')) {
                    $validated['phone'] = '233' . substr($phone, 1);
                } elseif (!str_starts_with($phone, '233')) {
                    $validated['phone'] = '233' . $phone;
                }
            }

            $user = User::create($validated);

            ActivityLogger::log('Created User', "User {$user->name} ({$user->role}) created by " . $current->name);

            // 🔔 Notify via Email & SMS
            try {
                if (!empty($user->email)) {
                    Mail::to($user->email)->send(new AccountCreatedMail($user, $plainPassword));
                }

                if (!empty($user->phone)) {
                    $msg = "Hi {$user->name}, 🎉 your Joelaar account has been created!\n"
                        . "📧 Email: {$user->email}\n"
                        . "🔐 Password: {$plainPassword}\n"
                        . "🌐 Login: " . url('/login');
                    SmsNotifier::send($user->phone, $msg);
                }
            } catch (\Throwable $e) {
                Log::warning('⚠️ Notification failed', ['error' => $e->getMessage()]);
            }

            return redirect()->route($this->redirectToIndex())
                ->with('success', '✅ User created successfully. Login details sent via Email & SMS.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to create user.');
        }
    }

    /** ✏️ Edit user info */
    public function edit(User $user)
    {
        try {
            return Inertia::render('Users/Edit', ['user' => $user]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to open user edit form.');
        }
    }

    /** 💾 Update user info */
    public function update(Request $request, User $user)
    {
        try {
            $current = auth()->user();

            // Prevent editing Superadmin unless you are Superadmin
            if ($user->role === 'superadmin' && $current->role !== 'superadmin') {
                return back()->with('error', '⚠️ You cannot modify the Superadmin account.');
            }

            $allowedRoles = $current->role === 'superadmin'
                ? ['superadmin', 'admin', 'staff', 'user']
                : ['staff', 'user'];

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'nullable|email|unique:users,email,' . $user->id,
                'phone'    => ['nullable', 'regex:/^(0|233)\d{9}$/'],
                'role'     => 'required|in:' . implode(',', $allowedRoles),
                'password' => 'nullable|string|min:6|confirmed',
            ]);

            // ☎️ Normalize phone
            if (!empty($validated['phone'])) {
                $phone = preg_replace('/\D/', '', $validated['phone']);
                if (str_starts_with($phone, '0')) {
                    $validated['phone'] = '233' . substr($phone, 1);
                } elseif (!str_starts_with($phone, '233')) {
                    $validated['phone'] = '233' . $phone;
                }
            }

            $newPassword = null;
            if (!empty($validated['password'])) {
                $newPassword = $validated['password'];
                $validated['password'] = bcrypt($newPassword);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);

            ActivityLogger::log('Updated User', "User {$user->name} updated by " . $current->name);

            if ($newPassword) {
                try {
                    if (!empty($user->email)) {
                        Mail::to($user->email)->send(new AccountCreatedMail($user, $newPassword));
                    }

                    if (!empty($user->phone)) {
                        $msg = "Hi {$user->name}, your Joelaar account password has been updated.\n"
                            . "📧 Email: {$user->email}\n"
                            . "🔐 New Password: {$newPassword}\n"
                            . "🌐 Login: " . url('/login');
                        SmsNotifier::send($user->phone, $msg);
                    }

                    return redirect()->route($this->redirectToIndex())
                        ->with('success', '✅ User updated and new credentials sent.');
                } catch (\Throwable $e) {
                    Log::error('❌ Failed to send password update message', ['error' => $e->getMessage()]);
                    return redirect()->route($this->redirectToIndex())
                        ->with('error', '⚠️ User updated but failed to send password email/SMS.');
                }
            }

            return redirect()->route($this->redirectToIndex())
                ->with('success', '✅ User details updated successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update user details.');
        }
    }

    /** 🗑️ Delete user safely */
    public function destroy(User $user)
    {
        try {
            if ($user->role === 'superadmin') {
                return back()->with('error', '⚠️ Superadmin cannot be deleted.');
            }

            ActivityLogger::log('Deleted User', "User {$user->name} deleted by " . auth()->user()->name);
            $user->delete();

            return redirect()->route($this->redirectToIndex())
                ->with('success', '✅ User deleted successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to delete user.');
        }
    }

    /** 🔁 Re-send login credentials */
    public function resendCredentials(User $user)
    {
        try {
            if (empty($user->email) && empty($user->phone)) {
                return back()->with('error', '⚠️ This user has no email or phone number set.');
            }

            $newPassword = Str::random(10);
            $user->update(['password' => bcrypt($newPassword)]);

            ActivityLogger::log('Resent Credentials', "Credentials re-sent to {$user->name}");

            if (!empty($user->email)) {
                Mail::to($user->email)->send(new \App\Mail\CredentialsResentMail($user, $newPassword));
            }

            if (!empty($user->phone)) {
                $msg = "Hi {$user->name}, 🔁 here are your new Joelaar login details:\n"
                    . "📧 Email: {$user->email}\n"
                    . "🔐 Password: {$newPassword}\n"
                    . "🌐 Login: " . url('/login');
                SmsNotifier::send($user->phone, $msg);
            }

            return back()->with('success', '✅ Login credentials successfully re-sent.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to resend credentials.');
        }
    }

    /** 🧰 Error handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ UserController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->redirectToIndex())->with('error', $message);
    }
}