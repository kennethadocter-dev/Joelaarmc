<?php

namespace App\Providers;

use App\Models\Payment;
use App\Observers\PaymentObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
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
        /*
        |--------------------------------------------------------------------------
        | 🌐 Force HTTPS in Production
        |--------------------------------------------------------------------------
        | Prevents mixed-content issues when deployed on HTTPS servers like Render.
        */
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        /*
        |--------------------------------------------------------------------------
        | 👁️ Model Observers
        |--------------------------------------------------------------------------
        | Automatically trigger custom logic (like updating loan balances)
        | when Payments are created, updated, or deleted.
        */
        Payment::observe(PaymentObserver::class);

        /*
        |--------------------------------------------------------------------------
        | 💾 Prevent String Length Errors on Older MySQL Versions
        |--------------------------------------------------------------------------
        */
        Schema::defaultStringLength(191);

        /*
        |--------------------------------------------------------------------------
        | 🔐 Role-Based Access Gates
        |--------------------------------------------------------------------------
        | Define custom access gates for different user roles.
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
        | Makes key data (user, app settings, flash messages) available globally
        | to all Inertia pages, so React/Vue components can access them easily.
        */
        Inertia::share([
            // 🧍 Authenticated User Info
            'auth' => fn() => auth()->check()
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

            // 🛡️ Permissions (role-based gates)
            'can' => fn() => [
                'superadmin' => auth()->user()?->can('access-superadmin') ?? false,
                'admin'      => auth()->user()?->can('access-admin') ?? false,
                'user'       => auth()->user()?->can('access-user') ?? false,
            ],

            // ⚙️ Application Settings
            'appSettings' => function () {
                $settings = Setting::first();
                return [
                    'app_name'        => $settings->app_name ?? 'Joelaar Micro-Credit',
                    'currency_symbol' => $settings->currency_symbol ?? '₵',
                    'interest_rate'   => $settings->interest_rate ?? 0,
                    'currency'        => $settings->currency ?? 'GHS',
                ];
            },

            // 💬 Flash Messages
            'flash' => fn() => [
                'success' => session('success'),
                'error'   => session('error'),
            ],

            // 🔑 CSRF Token (for frontend forms)
            'csrf_token' => fn() => csrf_token(),
        ]);
    }
}