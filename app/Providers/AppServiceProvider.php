<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Contracts\Auth\Authenticatable;

use App\Models\User;
use App\Models\Setting;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\Customer;

use App\Observers\LoanObserver;
use App\Observers\PaymentObserver;

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
        */
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        /*
        |--------------------------------------------------------------------------
        | 👁️ Model Observers
        |--------------------------------------------------------------------------
        | Automatically trigger logic (loan & payment recalculations)
        | whenever records are created, updated, or deleted.
        */
        Payment::observe(PaymentObserver::class);
        Loan::observe(LoanObserver::class);

        /*
        |--------------------------------------------------------------------------
        | 💾 Prevent String Length Errors on Older MySQL Versions
        |--------------------------------------------------------------------------
        */
        Schema::defaultStringLength(191);

        /*
        |--------------------------------------------------------------------------
        | 🔐 Role-Based Access Gates (Support for both Users & Customers)
        |--------------------------------------------------------------------------
        */
        Gate::define('access-superadmin', function (Authenticatable $user = null) {
            return $user instanceof User
                && ($user->is_super_admin || strtolower($user->role) === 'superadmin');
        });

        Gate::define('access-admin', function (Authenticatable $user = null) {
            return $user instanceof User
                && (
                    in_array(strtolower($user->role), ['admin', 'staff'])
                    || $user->is_super_admin
                    || strtolower($user->role) === 'superadmin'
                );
        });

        Gate::define('access-user', function (Authenticatable $user = null) {
            if ($user instanceof User) {
                return in_array(strtolower($user->role), ['user', 'customer', 'client'])
                    || $user->is_super_admin
                    || strtolower($user->role) === 'superadmin';
            }

            if ($user instanceof Customer) {
                return true; // ✅ allow all customers into their area
            }

            return false;
        });

        /*
        |--------------------------------------------------------------------------
        | 🌍 Global Inertia Shared Data
        |--------------------------------------------------------------------------
        */
        Inertia::share([
            // 🧍 Authenticated User Info
            'auth' => fn() => auth()->check()
                ? [
                    'user' => [
                        'id'             => auth()->id(),
                        'name'           => auth()->user()->name ?? auth()->user()->full_name ?? 'Unknown',
                        'email'          => auth()->user()->email ?? null,
                        'role'           => auth()->user() instanceof User
                            ? strtolower(auth()->user()->role)
                            : 'customer',
                        'is_super_admin' => auth()->user() instanceof User
                            ? (auth()->user()->is_super_admin ?? false)
                            : false,
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