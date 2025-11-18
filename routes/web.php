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
// AUTH
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

        // SETTINGS
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings');
        Route::put('/settings/update', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::put('/settings/reset', [AdminSettingsController::class, 'reset'])->name('settings.reset');

        // USERS
        Route::resource('users', SuperadminUserController::class)->only(['index', 'show']);

        // MANAGE CUSTOMERS
        Route::resource('manage-customers', ManageCustomersController::class)->only(['index', 'show']);

        // SYSTEM
        Route::get('/system', [SystemController::class, 'index'])->name('system.index');
        Route::post('/system/backup', [SystemController::class, 'backup']);
        Route::post('/system/restore', [SystemController::class, 'restore']);
        Route::post('/system/upload', [SystemController::class, 'upload']);
        Route::post('/system/delete-backup', [SystemController::class, 'deleteBackup']);
        Route::post('/system/recalculate-loans', [SystemController::class, 'recalculateLoans']);
        Route::post('/system/reset', [SystemController::class, 'reset']);

        // CUSTOMERS
        Route::resource('customers', SuperadminCustomerController::class)->only(['index', 'show']);

        // LOANS
        Route::resource('loans', AdminLoanController::class)->only(['index', 'show']);

        // REPORTS
        Route::resource('reports', AdminReportsController::class)->only(['index', 'show']);

        // SUPERADMIN CAN RECORD PAYMENTS
        Route::post('payments', [AdminPaymentController::class, 'store'])
            ->name('payments.store');

        // SUPERADMIN VIEW PAYMENTS
        Route::resource('payments', AdminPaymentController::class)
            ->only(['index', 'show'])
            ->names([
                'index' => 'payments.index',
                'show'  => 'payments.show',
            ]);

        // ACTIVITY LOGS
        Route::get('/activity', [SuperadminActivityController::class, 'index'])->name('activity.index');
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

        // CUSTOMER SUSPEND
        Route::post('/customers/{customer}/toggle-suspend',
            [AdminCustomerController::class, 'toggleSuspend'])
            ->name('customers.toggleSuspend');

        // LOANS
        Route::resource('loans', AdminLoanController::class);

        // Legacy: record-payment route inside loan controller
        Route::post('/loans/{loan}/record-payment', [AdminLoanController::class, 'recordPayment'])
            ->name('loans.recordPayment');

        // REPORTS
        Route::resource('reports', AdminReportsController::class)->only(['index', 'show']);
        Route::post('/reports/{id}/send-agreement', [AdminReportsController::class, 'sendAgreement'])
            ->name('reports.sendAgreement');
        Route::post('/reports/clear-failures', [AdminReportsController::class, 'clearEmailFailures'])
            ->name('reports.clearEmailFailures');

        // ADMIN PAYMENTS
        Route::post('/payments/store', [AdminPaymentController::class, 'store'])
            ->name('payments.store');
        #Route::post('payments', [AdminPaymentController::class, 'store'])
            #->name('payments.store');

        Route::resource('payments', AdminPaymentController::class)
            ->only(['index', 'show'])
            ->names([
                'index' => 'payments.index',
                'show'  => 'payments.show',
            ]);

        // SETTINGS
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings');
        Route::put('/settings/update', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::put('/settings/reset', [AdminSettingsController::class, 'reset'])->name('settings.reset');

        // ACTIVITY LOGS (view only)
        Route::get('/activity', [SuperadminActivityController::class, 'index'])->name('activity.index');
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
// 404
// ======================================================================
Route::fallback(fn () =>
    Inertia::render('Errors/404', [
        'title' => 'Not Found',
        'message' => 'The page you are looking for does not exist.',
    ])
);