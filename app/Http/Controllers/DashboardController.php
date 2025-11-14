<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // -------------------------------------------
    // REDIRECT /dashboard
    // -------------------------------------------
    public function redirect()
    {
        $user = Auth::user();
        if (!$user) return redirect()->route('login');

        if ($user->is_super_admin || $user->role === 'superadmin') {
            return redirect()->route('superadmin.dashboard');
        }

        // staff dashboard = admin dashboard
        if (in_array($user->role, ['admin', 'staff'])) {
            return redirect()->route('admin.dashboard');
        }

        abort(403, 'Unauthorized');
    }

    // -------------------------------------------
    // MAIN INDEX
    // -------------------------------------------
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) return redirect()->route('login');

            // SUPERADMIN
            if ($user->is_super_admin || $user->role === 'superadmin') {
                return $this->superAdminDashboard();
            }

            // ADMIN OR STAFF => same dashboard, different permissions
            if (in_array($user->role, ['admin', 'staff'])) {
                return $this->adminDashboard();
            }

            abort(403);

        } catch (\Throwable $e) {
            Log::error('Dashboard Error', [
                'error' => $e->getMessage(),
                'line'  => $e->getLine(),
            ]);

            return redirect()->route('login')->with('error', 'Dashboard failed to load.');
        }
    }

    // -------------------------------------------
    // SUPERADMIN (uses Shared/Dashboard)
    // -------------------------------------------
    private function superAdminDashboard()
    {
        $user = Auth::user();
        $summary = $this->getLoanSummary();

        return Inertia::render('Shared/Dashboard', [
            'auth' => ['user' => $user],
            'viewType' => 'superadmin',
            'stats' => $summary,
            'totalExpectedInterest' => $summary['expectedInterest'],
            'recentLoans' => $this->getRecentLoans(),
            'recentCustomers' => $this->getRecentCustomers(),
            'refreshUrl' => route('superadmin.dashboard.refresh'),
        ]);
    }

    // -------------------------------------------
    // ADMIN + STAFF (both use Shared/Dashboard)
    // -------------------------------------------
    private function adminDashboard()
    {
        $user = Auth::user();
        $summary = $this->getLoanSummary();

        return Inertia::render('Shared/Dashboard', [
            'auth' => ['user' => $user],
            'viewType' => strtolower($user->role), // "admin" or "staff"
            'stats' => $summary,
            'totalExpectedInterest' => $summary['expectedInterest'],
            'recentLoans' => $this->getRecentLoans(),
            'recentCustomers' => $this->getRecentCustomers(),
            'refreshUrl' => route('admin.dashboard.refresh'),
        ]);
    }

    // -------------------------------------------
    // LOAN SUMMARY
    // -------------------------------------------
    private function getLoanSummary()
    {
        return [
            'totalLoans'       => Loan::count(),
            'totalCustomers'   => Customer::count(),
            'totalDisbursed'   => Loan::sum('amount'),

            'pendingRepayment' => Loan::whereIn(DB::raw('LOWER(status)'), [
                'active', 'pending', 'overdue'
            ])->sum('amount_remaining'),

            'expectedInterest' => Loan::whereIn(DB::raw('LOWER(status)'), [
                'active', 'pending', 'overdue'
            ])->sum('expected_interest'),

            'interestEarned'   => Loan::whereRaw("LOWER(status)='paid'")
                ->sum('interest_earned'),

            'activeLoans'  => Loan::whereRaw("LOWER(status)='active'")->count(),
            'pendingLoans' => Loan::whereRaw("LOWER(status)='pending'")->count(),
            'paidLoans'    => Loan::whereRaw("LOWER(status)='paid'")->count(),
            'overdueLoans' => Loan::whereRaw("LOWER(status)='overdue'")->count(),
        ];
    }

    // -------------------------------------------
    // RECENT LOANS
    // -------------------------------------------
    private function getRecentLoans()
    {
        return Loan::select('id', 'client_name', 'amount', 'status', 'created_at')
            ->latest()
            ->take(5)
            ->get();
    }

    // -------------------------------------------
    // RECENT CUSTOMERS
    // -------------------------------------------
    private function getRecentCustomers()
    {
        return Customer::withSum('loans', 'amount')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'full_name' => $c->full_name ?? $c->email,
                    'phone' => $c->phone,
                    'loans_sum_amount' => $c->loans_sum_amount ?? 0,
                ];
            });
    }

    // -------------------------------------------
    // EXPECTED INTEREST
    // -------------------------------------------
    public function expectedInterest()
    {
        try {
            $user = Auth::user();

            $loans = Loan::whereIn(DB::raw('LOWER(status)'), [
                'active', 'pending', 'overdue'
            ])
                ->latest()
                ->get();

            $totalExpected = round(
                $loans->sum(fn($l) => $l->expected_interest ?? $l->interest ?? 0),
                2
            );

            return Inertia::render('ExpectedInterest', [
                'auth' => ['user' => $user],
                'loans' => $loans,
                'totalExpected' => $totalExpected,
            ]);

        } catch (\Throwable $e) {
            Log::error('Expected Interest Error', [
                'error' => $e->getMessage(),
                'line'  => $e->getLine()
            ]);

            $role = strtolower(Auth::user()->role ?? 'admin');
            return redirect()
                ->route($role === 'superadmin' ? 'superadmin.dashboard' : 'admin.dashboard')
                ->with('error', 'Failed to load expected interest page.');
        }
    }

    // -------------------------------------------
    // REFRESH WIDGET
    // -------------------------------------------
    public function refresh()
    {
        try {
            return response()->json([
                'expectedInterest' => Loan::whereIn(DB::raw('LOWER(status)'), [
                    'active','pending','overdue'
                ])->sum('expected_interest'),

                'interestEarned' => Loan::whereRaw("LOWER(status)='paid'")
                    ->sum('interest_earned'),

                'pendingRepayment' => Loan::whereIn(DB::raw('LOWER(status)'), [
                    'active','pending','overdue'
                ])->sum('amount_remaining'),

                'timestamp' => now()->toDateTimeString(),
            ]);

        } catch (\Throwable $e) {
            Log::error('Refresh failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Refresh failed'], 500);
        }
    }

    // -------------------------------------------
    // LOANS BY YEAR (chart)
    // -------------------------------------------
    public function getLoansByYear(Request $request)
    {
        try {
            $year = $request->input('year', now()->year);

            $rows = Loan::selectRaw("MONTH(created_at) AS m, COUNT(*) AS c")
                ->whereYear('created_at', $year)
                ->groupBy('m')
                ->pluck('c', 'm');

            $result = [];
            for ($m = 1; $m <= 12; $m++) {
                $result[str_pad($m, 2, '0', STR_PAD_LEFT)] = $rows[$m] ?? 0;
            }

            return response()->json([
                'year' => $year,
                'data' => $result
            ]);

        } catch (\Throwable $e) {
            Log::error('Chart error', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }
}