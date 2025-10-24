<?php

namespace App\Providers;

use App\Models\Payment;
use App\Observers\PaymentObserver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL; // ✅ Add this
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
        // ✅ Force HTTPS in production to avoid mixed-content errors
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // 👇 Existing observers
        Payment::observe(PaymentObserver::class);

        // ✅ Prevent string length errors in older MySQL versions
        Schema::defaultStringLength(191);

        /*
        |--------------------------------------------------------------------------
        | 🔐 Authorization Gates (Centralized Access Control)
        |--------------------------------------------------------------------------
        */
        Gate::define('access-superadmin', function (User $user) {
            return $user->is_super_admin || strtolower($user->role) === 'superadmin';
        });

        Gate::define('access-admin', function (User $user) {
            return in_array(strtolower($user->role), ['admin', 'staff'])
                || $user->is_super_admin
                || strtolower($user->role) === 'superadmin';
        });

        Gate::define('access-user', function (User $user) {
            return in_array(strtolower($user->role), ['user', 'customer', 'client'])
                || $user->is_super_admin
                || strtolower($user->role) === 'superadmin';
        });

        /*
        |--------------------------------------------------------------------------
        | 🌍 Global Inertia Shared Data
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

            // 🛡️ Role-based permissions
            'can' => fn () => [
                'superadmin' => auth()->user()?->can('access-superadmin') ?? false,
                'admin'      => auth()->user()?->can('access-admin') ?? false,
                'user'       => auth()->user()?->can('access-user') ?? false,
            ],

            // ⚙️ Global app settings
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