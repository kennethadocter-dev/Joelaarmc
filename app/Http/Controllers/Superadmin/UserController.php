<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Mail\AccountCreatedMail;
use App\Mail\CredentialsResentMail;
use App\Helpers\SmsNotifier;
use App\Helpers\ActivityLogger;

class UserController extends Controller
{
    public function __construct()
    {
        // ✅ Restrict access to Superadmin only
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user || $user->role !== 'superadmin') {
                abort(403, 'Access denied. Only Superadmins can manage system users.');
            }
            return $next($request);
        });
    }

    /** 🧭 List all system users */
    public function index(Request $request)
    {
        try {
            $q = trim($request->get('q', ''));
            $roleFilter = $request->get('role', '');
            $sortField = $request->get('sort', 'created_at');
            $direction = strtolower($request->get('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

            $allowedSorts = ['name', 'email', 'phone', 'role', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }

            // 🧩 Filter and sort internal users
            $users = User::query()
                ->select('id', 'name', 'email', 'phone', 'role', 'created_at')
                ->when($q, fn($query) =>
                    $query->where(function ($sub) use ($q) {
                        $sub->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%");
                    })
                )
                ->when($roleFilter, fn($query) => $query->where('role', $roleFilter))
                ->orderBy($sortField, $direction)
                ->get();

            // 🧮 Count totals for role cards
            $counts = [
                'superadmin' => User::where('role', 'superadmin')->count(),
                'admin'      => User::where('role', 'admin')->count(),
                'staff'      => User::where('role', 'staff')->count(),
                'user'       => User::where('role', 'user')->count(),
            ];

            return Inertia::render('Superadmin/Users/Index', [
                'users'   => $users,
                'counts'  => $counts,
                'filters' => [
                    'q'         => $q,
                    'role'      => $roleFilter,
                    'sort'      => $sortField,
                    'direction' => $direction,
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load users list.');
        }
    }

    /** ➕ Show Create Form */
    public function create()
    {
        return Inertia::render('Superadmin/Users/Create');
    }

    /** 💾 Store new user */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'nullable|email|unique:users,email',
                'phone'    => ['nullable', 'regex:/^(0|233)\d{9}$/'],
                'role'     => 'required|in:superadmin,admin,staff,user',
                'password' => 'nullable|string|min:6|confirmed',
            ]);

            $plainPassword = $validated['password'] ?? Str::random(8);
            $validated['password'] = bcrypt($plainPassword);

            // 📞 Normalize Ghana phone numbers
            if (!empty($validated['phone'])) {
                $phone = preg_replace('/\D/', '', $validated['phone']);
                if (str_starts_with($phone, '0')) {
                    $validated['phone'] = '233' . substr($phone, 1);
                } elseif (!str_starts_with($phone, '233')) {
                    $validated['phone'] = '233' . $phone;
                }
            }

            $user = User::create($validated);

            ActivityLogger::log('Created User', "Superadmin created {$user->name} ({$user->role}).");

            // ✉️ Notify new user
            $this->notifyUser($user, $plainPassword, 'created');

            return redirect()->route('superadmin.users.index')
                ->with('success', "✅ {$user->name} ({$user->role}) created successfully.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to create user.');
        }
    }

    /** ✏️ Edit form */
    public function edit(User $user)
    {
        return Inertia::render('Superadmin/Users/Edit', ['user' => $user]);
    }

    /** 🔁 Update user info */
    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'nullable|email|unique:users,email,' . $user->id,
                'phone'    => ['nullable', 'regex:/^(0|233)\d{9}$/'],
                'role'     => 'required|in:superadmin,admin,staff,user',
                'password' => 'nullable|string|min:6|confirmed',
            ]);

            // 🧠 Prevent Superadmin downgrade
            if ($user->role === 'superadmin' && $validated['role'] !== 'superadmin') {
                $validated['role'] = 'superadmin';
                session()->flash('error', '⚠️ You cannot change the role of a Superadmin.');
            }

            // 📞 Normalize phone
            if (!empty($validated['phone'])) {
                $phone = preg_replace('/\D/', '', $validated['phone']);
                if (str_starts_with($phone, '0')) {
                    $validated['phone'] = '233' . substr($phone, 1);
                } elseif (!str_starts_with($phone, '233')) {
                    $validated['phone'] = '233' . $phone;
                }
            }

            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);
            ActivityLogger::log('Updated User', "Superadmin updated {$user->name} ({$user->role}).");

            return redirect()->route('superadmin.users.index')
                ->with('success', "✅ {$user->name}'s information updated successfully.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update user.');
        }
    }

    /** 🗑 Delete user */
    public function destroy(User $user)
    {
        try {
            if ($user->role === 'superadmin') {
                return back()->with('error', '❌ You cannot delete another Superadmin.');
            }

            $name = $user->name;
            $role = $user->role;

            $user->delete();
            ActivityLogger::log('Deleted User', "Superadmin deleted {$name} ({$role}).");

            return redirect()->route('superadmin.users.index')
                ->with('success', "✅ {$name} ({$role}) deleted successfully.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to delete user.');
        }
    }

    /** 🔁 Resend credentials */
    public function resendCredentials(User $user)
    {
        try {
            $newPassword = Str::random(10);
            $user->update(['password' => bcrypt($newPassword)]);

            ActivityLogger::log('Resent Credentials', "Superadmin resent credentials to {$user->name}.");
            $this->notifyUser($user, $newPassword, 'resent');

            return back()->with('success', '✅ Login credentials resent successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '❌ Failed to resend credentials.');
        }
    }

    /** ✉️ Notify user (email + SMS) */
    private function notifyUser(User $user, string $password, string $type = 'created'): void
    {
        try {
            if (!empty($user->email)) {
                $mailable = $type === 'created'
                    ? new AccountCreatedMail($user, $password)
                    : new CredentialsResentMail($user, $password);

                Mail::to($user->email)->send($mailable);
            }

            if (!empty($user->phone)) {
                $message = $type === 'created'
                    ? "Hi {$user->name}, your JLMC account has been created.\nEmail: {$user->email}\nPassword: {$password}\nLogin: " . url('/login')
                    : "Hi {$user->name}, your JLMC login credentials have been reset.\nEmail: {$user->email}\nPassword: {$password}\nLogin: " . url('/login');

                SmsNotifier::send($user->phone, $message);
            }
        } catch (\Throwable $notifyError) {
            Log::warning('⚠️ Notification failed', [
                'user' => $user->email,
                'error' => $notifyError->getMessage(),
            ]);
        }
    }

    /** ⚙️ Centralized Error Handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ Superadmin UserController Error', [
            'user'  => auth()->user()?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route('superadmin.users.index')->with('error', $message);
    }
}