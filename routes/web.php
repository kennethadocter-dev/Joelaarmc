<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// AUTH
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// PROFILE
use App\Http\Controllers\ProfileController;

// DASHBOARD
use App\Http\Controllers\DashboardController;

// ADMIN CONTROLLERS
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\LoanController as AdminLoanController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;

// SUPERADMIN CONTROLLERS
use App\Http\Controllers\Superadmin\UserController as SuperadminUserController;
use App\Http\Controllers\Superadmin\CustomerController as SuperadminCustomerController;
use App\Http\Controllers\Superadmin\ManageCustomersController;
use App\Http\Controllers\Superadmin\SystemController;
use App\Http\Controllers\Superadmin\ActivityController as SuperadminActivityController;


// --------------------------------------------------
// ROOT → LOGIN
// --------------------------------------------------
Route::get('/', fn () => redirect()->route('login'));


// --------------------------------------------------
// DASHBOARD REDIRECT
// --------------------------------------------------
Route::get('/dashboard', [DashboardController::class, 'redirect'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


// --------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');



// ======================================================================
//                           SUPERADMIN ROUTES
// ======================================================================
Route::prefix('superadmin')
    ->middleware(['auth', 'verified'])
    ->as('superadmin.')
    ->group(function () {

        // DASHBOARD
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/refresh', [DashboardController::class, 'refresh'])->name('dashboard.refresh');
        Route::get('/dashboard/loans-by-year', [DashboardController::class, 'getLoansByYear'])->name('dashboard.loansByYear');
        Route::get('/dashboard/expected-interest', [DashboardController::class, 'expectedInterest'])->name('dashboard.expectedInterest');

        // SETTINGS (✓ matches Sidebar)
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/reset', [AdminSettingsController::class, 'reset'])->name('settings.reset');

        // USERS
        Route::resource('users', SuperadminUserController::class);

        // RESEND USER CREDENTIALS
        Route::post('/users/{user}/resend-credentials',
            [SuperadminUserController::class, 'resendCredentials']
        )->name('users.resendCredentials');

        // MANAGE CUSTOMERS
        Route::resource('manage-customers', ManageCustomersController::class)->only(['index', 'show']);

        // SYSTEM CONTROL
        Route::get('/system', [SystemController::class, 'index'])->name('system.index');
        Route::post('/system/backup', [SystemController::class, 'backup'])->name('system.backup');
        Route::post('/system/restore', [SystemController::class, 'restore'])->name('system.restore');
        Route::post('/system/upload', [SystemController::class, 'upload'])->name('system.upload');
        Route::post('/system/delete-backup', [SystemController::class, 'deleteBackup'])->name('system.deleteBackup');
        Route::post('/system/recalculate-loans', [SystemController::class, 'recalculateLoans'])->name('system.recalculateLoans');
        Route::post('/system/reset', [SystemController::class, 'reset'])->name('system.reset');

        // CUSTOMERS (view only)
        Route::resource('customers', SuperadminCustomerController::class)->only(['index', 'show']);

        // LOANS (view only)
        Route::resource('loans', AdminLoanController::class)->only(['index', 'show']);

        // REPORTS
        Route::resource('reports', AdminReportsController::class)->only(['index', 'show']);

        // PAYMENTS
        Route::post('payments', [AdminPaymentController::class, 'store'])->name('payments.store');
        Route::resource('payments', AdminPaymentController::class)->only(['index', 'show']);

        // ACTIVITY LOGS
        Route::get('/activity', [SuperadminActivityController::class, 'index'])->name('activity.index');
        Route::delete('/activity/clear', [SuperadminActivityController::class, 'clear'])->name('activity.clear'); // ✓ FIXED

         // ACTIVITY LOGS (Superadmins can view)
        Route::get('/activity', [SuperadminActivityController::class, 'index'])->name('activity.index');
        Route::delete('/activity/clear', [SuperadminActivityController::class, 'clear'])->name('activity.clear'); // ✓ FIXED

        Route::get('/activity-test', function () {
            return Inertia::render('Superadmin/Activity/Test');
        });
    });



// ======================================================================
//                              ADMIN ROUTES
// ======================================================================
Route::prefix('admin')
    ->middleware(['auth', 'verified'])
    ->as('admin.')
    ->group(function () {

        // DASHBOARD
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/refresh', [DashboardController::class, 'refresh'])->name('dashboard.refresh');
        Route::get('/dashboard/loans-by-year', [DashboardController::class, 'getLoansByYear'])->name('dashboard.loansByYear');
        Route::get('/dashboard/expected-interest', [DashboardController::class, 'expectedInterest'])->name('dashboard.expectedInterest');

        // CUSTOMERS
        Route::resource('customers', AdminCustomerController::class);

        // Suspend / Unsuspend
        Route::post('/customers/{customer}/toggle-suspend',
            [AdminCustomerController::class, 'toggleSuspend']
        )->name('customers.toggleSuspend');

        // LOANS
        Route::resource('loans', AdminLoanController::class);

        Route::post('/loans/{loan}/record-payment', [AdminLoanController::class, 'recordPayment'])
            ->name('loans.recordPayment');

        // REPORTS
        Route::resource('reports', AdminReportsController::class)->only(['index', 'show']);
        Route::post('/reports/{id}/send-agreement', [AdminReportsController::class, 'sendAgreement'])
            ->name('reports.sendAgreement');
        Route::post('/reports/clear-failures', [AdminReportsController::class, 'clearEmailFailures'])
            ->name('reports.clearEmailFailures');

        // PAYMENTS
        Route::post('/payments/store', [AdminPaymentController::class, 'store'])
            ->name('payments.store');
        Route::resource('payments', AdminPaymentController::class)->only(['index', 'show']);

        // SETTINGS (✓ matches Sidebar)
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/reset', [AdminSettingsController::class, 'reset'])->name('settings.reset');
 

    });


// ======================================================================
// PROFILE
// ======================================================================
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


// ======================================================================
// 404 PAGE
// ======================================================================
Route::fallback(fn () =>
    Inertia::render('Errors/404', [
        'title' => 'Not Found',
        'message' => 'The page you are looking for does not exist.',
    ])
);