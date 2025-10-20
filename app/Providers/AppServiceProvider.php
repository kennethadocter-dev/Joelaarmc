<?php

namespace App\Providers;

use App\Models\Payment;
use App\Observers\PaymentObserver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Setting;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        {
            Payment::observe(PaymentObserver::class);
        }
        // ✅ Prevent string length errors in older MySQL versions
        Schema::defaultStringLength(191);

        /*
        |--------------------------------------------------------------------------
        | 🔐 Authorization Gates (Centralized Access Control)
        |--------------------------------------------------------------------------
        | Superadmins automatically pass all gates.
        | Admins & staff get admin access.
        | Regular users only access their personal area.
        |--------------------------------------------------------------------------
        */

        Gate::define('access-superadmin', function (User $user) {
            return $user->is_super_admin || strtolower($user->role) === 'superadmin';
        });

        Gate::define('access-admin', function (User $user) {
            // Allow admin, staff, or anyone with superadmin privileges
            return in_array(strtolower($user->role), ['admin', 'staff'])
                || $user->is_super_admin
                || strtolower($user->role) === 'superadmin';
        });

        Gate::define('access-user', function (User $user) {
            // Allow normal users (and superadmins by default)
            return in_array(strtolower($user->role), ['user', 'customer', 'client'])
                || $user->is_super_admin
                || strtolower($user->role) === 'superadmin';
        });

        /*
        |--------------------------------------------------------------------------
        | 🌍 Global Inertia Shared Data
        |--------------------------------------------------------------------------
        | Ensures every Inertia page has access to:
        | - Logged-in user info
        | - Role permissions (via Gate)
        | - App settings (from DB)
        | - Flash messages
        |--------------------------------------------------------------------------
        */
        Inertia::share([
            // 🧍 Authenticated User
            'auth' => fn () => auth()->user()
                ? [
                    'user' => [
                        'id'             => auth()->id(),
                        'name'           => auth()->user()->name,
                        'email'          => auth()->user()->email,
                        'role'           => strtolower(auth()->user()->role),
                        'is_super_admin' => auth()->user()->is_super_admin,
                    ],
                ]
                : ['user' => null],

            // 🛡️ Role-based permissions (for frontend)
            'can' => fn () => [
                'superadmin' => auth()->user()?->can('access-superadmin') ?? false,
                'admin'      => auth()->user()?->can('access-admin') ?? false,
                'user'       => auth()->user()?->can('access-user') ?? false,
            ],

            // ⚙️ Global app settings (once per request)
            'appSettings' => function () {
                $settings = Setting::first();
                return [
                    'app_name'        => $settings->app_name ?? 'Joelaar Micro-Credit',
                    'currency_symbol' => $settings->currency_symbol ?? '₵',
                    'interest_rate'   => $settings->interest_rate ?? 0,
                    'currency'        => $settings->currency ?? 'GHS',
                ];
            },

            // 💬 Flash messages
            'flash' => fn () => [
                'success' => session('success'),
                'error'   => session('error'),
            ],

            // 🔑 CSRF token
            'csrf_token' => fn () => csrf_token(),
        ]);
    }
}