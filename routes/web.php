<?php

use Illuminate\Support\Facades\Route;

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
| All routes require authentication — no public access.
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

        // 📊 Chart Data (for Dashboard Graph)
        Route::get('/dashboard/loans-by-year', [DashboardController::class, 'getLoansByYear'])
            ->name('admin.dashboard.loansByYear');

        // 👥 Customers
        Route::get('/customers/search', [CustomerController::class, 'search'])->name('admin.customers.search');
        Route::post('/customers/{id}/toggle', [CustomerController::class, 'toggleStatus'])->name('admin.customers.toggleStatus');
        Route::post('/customers/{id}/suspend', [CustomerController::class, 'suspend'])->name('admin.customers.suspend');
        Route::resource('customers', CustomerController::class)->names('admin.customers');

        // 💰 Loans
        Route::resource('loans', LoanController::class)->names('admin.loans');
        Route::post('/loans/{loan}/activate', [LoanController::class, 'activate'])->name('admin.loans.activate');

        // 💵 Record Cash Payment (✅ moved to PaymentController)
        Route::post('/loans/{loan}/record-payment', [PaymentController::class, 'store'])->name('admin.loans.recordPayment');

        // 💵 Payments
        Route::post('/payments/store', [PaymentController::class, 'store'])->name('admin.payments.store');
        Route::post('/loans/{loan}/payment', [PaymentController::class, 'store'])->name('admin.loans.payment');

        // 🧾 View or Download Individual Payment Receipt (PDF)
        Route::get('/loans/{loan}/receipt/{payment}', [PaymentController::class, 'viewReceipt'])
            ->name('admin.loans.viewReceipt');

        // 🔗 Customer → Loan view
        Route::get('/customers/{customer}/loans', [LoanController::class, 'customerLoans'])->name('admin.customers.loans');
        Route::get('/loans-by-year', [LoanController::class, 'getLoansByYear'])->name('admin.loans.byYear');

        // 📊 Reports
        Route::get('/reports', [ReportsController::class, 'index'])->name('admin.reports.index');
        Route::get('/reports/{loan}', [ReportsController::class, 'show'])->name('admin.reports.show');
        Route::post('/reports/{loan}/send-agreement', [ReportsController::class, 'sendAgreement'])->name('admin.reports.sendAgreement');
        Route::get('/reports/{loan}/send-agreement', fn() => redirect()->route('admin.reports.index'));
        Route::delete('/reports/failures/clear', [ReportsController::class, 'clearEmailFailures'])->name('admin.reports.clearFailures');

        // ⚙️ Settings
        Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('admin.settings.update');
        Route::put('/settings/reset', [SettingsController::class, 'reset'])->name('admin.settings.reset');

        // ⚙️ System Control
        Route::get('/system', [SystemController::class, 'index'])->name('admin.system.index');
        Route::post('/system/reset', [SystemController::class, 'resetData'])->name('admin.system.reset');
        Route::post('/system/backup', [SystemController::class, 'backupData'])->name('admin.system.backup');
        Route::post('/system/restore', [SystemController::class, 'restoreData'])->name('admin.system.restore');
        Route::get('/system/backups', [SystemController::class, 'listBackups'])->name('admin.system.listBackups');
        Route::get('/system/download/{file}', [SystemController::class, 'downloadBackup'])->where('file', '.*')->name('admin.system.download');
        Route::post('/system/upload', [SystemController::class, 'uploadBackup'])->name('admin.system.upload');
        Route::get('/system/preview-reset', [SystemController::class, 'previewReset'])->name('admin.system.previewReset');
        Route::delete('/system/delete/{file}', [SystemController::class, 'deleteBackup'])->name('admin.system.deleteBackup');
        Route::get('/system/refresh', [SystemController::class, 'refreshBackups'])->name('admin.system.refreshBackups');

        // 💳 Paystack Integration (Admin via PaymentController)
        Route::post('/paystack/initialize', [PaymentController::class, 'initialize'])->name('admin.paystack.initialize');
        Route::get('/paystack/callback', [PaymentController::class, 'callback'])->name('admin.paystack.callback');
    });

    /* ====================================================================
       👑 SUPERADMIN PORTAL → /superadmin
       ==================================================================== */
    Route::prefix('superadmin')->middleware('can:access-superadmin')->group(function () {

        // 🏠 Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('superadmin.dashboard');

        // 📊 Chart Data (for Dashboard Graph)
        Route::get('/dashboard/loans-by-year', [DashboardController::class, 'getLoansByYear'])
            ->name('superadmin.dashboard.loansByYear');

        // 👥 Manage Users
        Route::resource('users', UserController::class)->names('superadmin.users');
        Route::post('/users/{user}/resend', [UserController::class, 'resendCredentials'])->name('superadmin.users.resend');

        // 👥 Customers
        Route::get('/customers/search', [CustomerController::class, 'search'])->name('superadmin.customers.search');
        Route::post('/customers/{id}/toggle', [CustomerController::class, 'toggleStatus'])->name('superadmin.customers.toggleStatus');
        Route::post('/customers/{id}/suspend', [CustomerController::class, 'suspend'])->name('superadmin.customers.suspend');
        Route::resource('customers', CustomerController::class)->names('superadmin.customers');

        // 💰 Loans
        Route::resource('loans', LoanController::class)->names('superadmin.loans');
        Route::post('/loans/{loan}/activate', [LoanController::class, 'activate'])->name('superadmin.loans.activate');

        // 💵 Record Cash Payment (✅ moved to PaymentController)
        Route::post('/loans/{loan}/record-payment', [PaymentController::class, 'store'])->name('superadmin.loans.recordPayment');

        // 💵 Payments
        Route::post('/payments/store', [PaymentController::class, 'store'])->name('superadmin.payments.store');
        Route::post('/loans/{loan}/payment', [PaymentController::class, 'store'])->name('superadmin.loans.payment');

        // 🧾 View or Download Individual Payment Receipt (PDF)
        Route::get('/loans/{loan}/receipt/{payment}', [PaymentController::class, 'viewReceipt'])
            ->name('superadmin.loans.viewReceipt');

        // 🔗 Customer → Loan view
        Route::get('/customers/{customer}/loans', [LoanController::class, 'customerLoans'])->name('superadmin.customers.loans');
        Route::get('/loans-by-year', [LoanController::class, 'getLoansByYear'])->name('superadmin.loans.byYear');

        // 📊 Reports
        Route::get('/reports', [ReportsController::class, 'index'])->name('superadmin.reports.index');
        Route::get('/reports/{loan}', [ReportsController::class, 'show'])->name('superadmin.reports.show');
        Route::post('/reports/{loan}/send-agreement', [ReportsController::class, 'sendAgreement'])->name('superadmin.reports.sendAgreement');
        Route::get('/reports/{loan}/send-agreement', fn() => redirect()->route('superadmin.reports.index'));
        Route::delete('/reports/failures/clear', [ReportsController::class, 'clearEmailFailures'])->name('superadmin.reports.clearFailures');

        // ⚙️ Settings & System
        Route::get('/settings', [SettingsController::class, 'index'])->name('superadmin.settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('superadmin.settings.update');
        Route::put('/settings/reset', [SettingsController::class, 'reset'])->name('superadmin.settings.reset');

        Route::get('/system', [SystemController::class, 'index'])->name('superadmin.system.index');
        Route::post('/system/reset', [SystemController::class, 'resetData'])->name('superadmin.system.reset');
        Route::post('/system/backup', [SystemController::class, 'backupData'])->name('superadmin.system.backup');
        Route::post('/system/restore', [SystemController::class, 'restoreData'])->name('superadmin.system.restore');
        Route::get('/system/backups', [SystemController::class, 'listBackups'])->name('superadmin.system.listBackups');
        Route::get('/system/download/{file}', [SystemController::class, 'downloadBackup'])->where('file', '.*')->name('superadmin.system.download');
        Route::post('/system/upload', [SystemController::class, 'uploadBackup'])->name('superadmin.system.upload');
        Route::get('/system/preview-reset', [SystemController::class, 'previewReset'])->name('superadmin.system.previewReset');
        Route::delete('/system/delete/{file}', [SystemController::class, 'deleteBackup'])->name('superadmin.system.deleteBackup');
        Route::get('/system/refresh', [SystemController::class, 'refreshBackups'])->name('superadmin.system.refreshBackups');

        // 💳 Paystack Integration (Superadmin via PaymentController)
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
   🔐 AUTH ROUTES (login / logout)
   ======================================================================== */
require __DIR__ . '/auth.php';