<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Import Controllers
|--------------------------------------------------------------------------
*/

// ===============================================================
// ✅ ADMIN CONTROLLERS (in app/Http/Controllers/Admin)
// ===============================================================
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\LoanController;
use App\Http\Controllers\Admin\ClauseController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\PaymentController;

// ===============================================================
// ✅ SHARED CONTROLLERS (global in app/Http/Controllers)
// ===============================================================
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 🏠 Redirect dashboard alias
Route::get('/dashboard', fn() => redirect()->route('dashboard.redirect'))->name('dashboard');

// 🏠 Root route — redirect logged users
Route::get('/', fn() => auth()->check()
    ? redirect()->route('dashboard.redirect')
    : redirect()->route('login'));

/* ========================================================================
   🔐 AUTHENTICATED ROUTES
   ======================================================================== */
Route::middleware(['auth'])->group(function () {

    /* --------------------------------------------------------------------
       🎯 Smart redirect based on user role
       -------------------------------------------------------------------- */
    Route::get('/dashboard-redirect', function () {
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
    })->name('dashboard.redirect');

    /* ====================================================================
       👤 USER PORTAL → /u/{username}
       ==================================================================== */
    Route::prefix('u')->group(function () {
        Route::get('/{username}', [DashboardController::class, 'index'])->name('user.dashboard');
        Route::get('/{username}/profile', [ProfileController::class, 'edit'])->name('user.profile');
        Route::patch('/{username}/profile', [ProfileController::class, 'update'])->name('user.profile.update');
        Route::delete('/{username}/profile', [ProfileController::class, 'destroy'])->name('user.profile.destroy');
    });

    /* ====================================================================
       🧑‍💼 ADMIN / STAFF PORTAL → /admin
       ==================================================================== */
    Route::prefix('admin')->middleware('can:access-admin')->group(function () {

        // 🏠 Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/dashboard/loans-by-year', [DashboardController::class, 'getLoansByYear'])->name('admin.dashboard.loansByYear');

        // 👥 Customers
        Route::get('/customers/search', [CustomerController::class, 'search'])->name('admin.customers.search');
        Route::resource('customers', CustomerController::class)->names('admin.customers');

        // 💰 Loans
        Route::resource('loans', LoanController::class)->names('admin.loans');
        Route::post('/loans/{loan}/activate', [LoanController::class, 'activate'])->name('admin.loans.activate');

        // 💵 Payments (Full-page Record Payment)
        Route::get('/payments/create', [PaymentController::class, 'create'])->name('admin.payments.create');
        Route::post('/payments/store', [PaymentController::class, 'store'])->name('admin.payments.store');
        Route::post('/loans/{loan}/record-payment', [PaymentController::class, 'store'])->name('admin.loans.recordPayment');

        // 🧾 Receipts
        Route::get('/loans/{loan}/receipt/{payment}', [PaymentController::class, 'viewReceipt'])->name('admin.loans.viewReceipt');

        // ⚙️ Settings / System
        Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('admin.settings.update');
        Route::get('/system', [SystemController::class, 'index'])->name('admin.system.index');
        Route::post('/system/backup', [SystemController::class, 'backupData'])->name('admin.system.backup');

        // 💳 Paystack Integration
        Route::post('/paystack/initialize', [PaymentController::class, 'initialize'])->name('admin.paystack.initialize');
        Route::get('/paystack/callback', [PaymentController::class, 'callback'])->name('admin.paystack.callback');
    });

    /* ====================================================================
       👑 SUPERADMIN PORTAL → /superadmin
       ==================================================================== */
    Route::prefix('superadmin')->middleware('can:access-superadmin')->group(function () {

        // 🏠 Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('superadmin.dashboard');
        Route::get('/dashboard/loans-by-year', [DashboardController::class, 'getLoansByYear'])->name('superadmin.dashboard.loansByYear');

        // 👥 Users & Customers
        Route::resource('users', UserController::class)->names('superadmin.users');
        Route::get('/customers/search', [CustomerController::class, 'search'])->name('superadmin.customers.search');
        Route::resource('customers', CustomerController::class)->names('superadmin.customers');

        // 💰 Loans
        Route::resource('loans', LoanController::class)->names('superadmin.loans');
        Route::post('/loans/{loan}/activate', [LoanController::class, 'activate'])->name('superadmin.loans.activate');

        // 💵 Payments (Full-page Record Payment)
        Route::get('/payments/create', [PaymentController::class, 'create'])->name('superadmin.payments.create');
        Route::post('/payments/store', [PaymentController::class, 'store'])->name('superadmin.payments.store');
        Route::post('/loans/{loan}/record-payment', [PaymentController::class, 'store'])->name('superadmin.loans.recordPayment');

        // 🧾 Receipts
        Route::get('/loans/{loan}/receipt/{payment}', [PaymentController::class, 'viewReceipt'])->name('superadmin.loans.viewReceipt');

        // ⚙️ Settings / System
        Route::get('/settings', [SettingsController::class, 'index'])->name('superadmin.settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('superadmin.settings.update');
        Route::get('/system', [SystemController::class, 'index'])->name('superadmin.system.index');
        Route::post('/system/backup', [SystemController::class, 'backupData'])->name('superadmin.system.backup');

        // 💳 Paystack Integration
        Route::post('/paystack/initialize', [PaymentController::class, 'initialize'])->name('superadmin.paystack.initialize');
        Route::get('/paystack/callback', [PaymentController::class, 'callback'])->name('superadmin.paystack.callback');

        // 🧾 Activity Logs
        Route::get('/activity', [ActivityController::class, 'index'])->name('superadmin.activity');
        Route::delete('/activity/clear', [ActivityController::class, 'clear'])->name('superadmin.activity.clear');
    });

    /* ====================================================================
       🧍 Global Profile Routes
       ==================================================================== */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/* ========================================================================
   🔍 CSRF CHECK (for debugging)
   ======================================================================== */
Route::get('/csrf-check', fn() => response()->json(['csrf' => csrf_token()]));

/* ========================================================================
   🔐 AUTH ROUTES (login / logout)
   ======================================================================== */
require __DIR__ . '/auth.php';