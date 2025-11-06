<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * 🏠 Main Dashboard
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role ?? '');

            // =====================================================
            // 🧑‍💼 ADMIN / SUPERADMIN DASHBOARD
            // =====================================================
            if ($role !== 'user') {
                $currentYear = now()->year;

                $interestEarned = Loan::where(DB::raw('LOWER(status)'), 'paid')
                    ->sum('interest_earned');

                $pendingRepayment = 0;

                if (Schema::hasTable('loan_schedules')) {
                    $pendingRepayment = DB::table('loan_schedules')
                        ->where('is_paid', 0)
                        ->sum('amount_left');
                } elseif (Schema::hasColumn('loans', 'amount_remaining')) {
                    $pendingRepayment = DB::table('loans')
                        ->whereIn(DB::raw('LOWER(status)'), ['active', 'overdue'])
                        ->sum('amount_remaining');
                } else {
                    $pendingRepayment = Loan::whereIn(DB::raw('LOWER(status)'), ['active', 'overdue'])
                        ->get()
                        ->sum(function ($loan) {
                            $interestRate = is_numeric($loan->interest_rate) ? $loan->interest_rate : 0;
                            $totalWithInterest = $loan->amount + ($loan->amount * $interestRate / 100);
                            $paid = DB::table('payments')->where('loan_id', $loan->id)->sum('amount');
                            return max(0, round($totalWithInterest - abs($paid ?? 0), 2));
                        });
                }

                $summary = [
                    'totalLoans'       => Loan::count(),
                    'totalCustomers'   => Customer::count(),
                    'totalDisbursed'   => round(Loan::sum('amount'), 2),
                    'pendingRepayment' => round($pendingRepayment ?? 0, 2),
                    'overdueLoans'     => Loan::where(DB::raw('LOWER(status)'), 'overdue')->count(),
                    'interestEarned'   => round($interestEarned ?? 0, 2),
                    'activeLoans'      => Loan::where(DB::raw('LOWER(status)'), 'active')->count(),
                    'pendingLoans'     => Loan::where(DB::raw('LOWER(status)'), 'pending')->count(),
                    'paidLoans'        => Loan::where(DB::raw('LOWER(status)'), 'paid')->count(),
                ];

                $recentLoans = Loan::latest()
                    ->take(5)
                    ->get(['id', 'client_name', 'amount', 'status', 'created_at']);

                $recentCustomers = Customer::withSum('loans', 'amount')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($c) {
                        $c->name = $c->full_name ?: ($c->email ?? 'Unnamed');
                        return $c;
                    });

                return Inertia::render('Dashboard', [
                    'auth'            => ['user' => $user],
                    'stats'           => $summary,
                    'recentLoans'     => $recentLoans,
                    'recentCustomers' => $recentCustomers,
                    'userLoans'       => null,
                    'userPayments'    => null,
                    'lastPayment'     => null,
                ]);
            }

            // =====================================================
            // 👤 CUSTOMER DASHBOARD
            // =====================================================
            $customer = Customer::where('email', $user->email)
                ->orWhere('phone', $user->phone)
                ->with(['loans.payments' => fn($q) => $q->latest()])
                ->first();

            if (!$customer) {
                return redirect()->route('dashboard')
                    ->with('error', '⚠️ Your customer record could not be found. Please contact support.');
            }

            $loans = $customer->loans ?? collect();

            $activeLoan = $loans->whereIn('status', ['active', 'overdue'])->first()
                ?: $loans->sortByDesc('created_at')->first();

            if (!$activeLoan) {
                return Inertia::render('Dashboard', [
                    'auth' => ['user' => $user],
                    'userLoans' => [
                        'totalLoan' => 0,
                        'amountPaid' => 0,
                        'amountLeft' => 0,
                        'status' => 'No active loan',
                    ],
                    'loanHistory' => [],
                    'userPayments' => [],
                    'lastPayment' => null,
                ]);
            }

            // ✅ Use the same multiplier logic used in LoanController
            $multiplier = $this->getInterestMultiplier($activeLoan);
            $totalWithInterest = round($activeLoan->amount * $multiplier, 2);

            $amountPaid = DB::table('payments')
                ->where('loan_id', $activeLoan->id)
                ->sum('amount');

            $amountLeft = round(max(0, $totalWithInterest - $amountPaid), 2);

            $lastPayment = Payment::where('loan_id', $activeLoan->id)
                ->latest('paid_at')
                ->first(['amount', 'paid_at', 'reference']);

            $nextDueDate = $activeLoan?->due_date ? Carbon::parse($activeLoan->due_date) : null;
            $termMonths = $activeLoan?->term_months ?? 1;
            $nextPaymentAmount = round($totalWithInterest / $termMonths, 2);
            $daysRemaining = $nextDueDate ? now()->diffInDays($nextDueDate, false) : null;

            $payments = Payment::where('loan_id', $activeLoan->id)
                ->latest()
                ->take(10)
                ->get(['id', 'amount', 'paid_at', 'reference']);

            $loanHistory = $loans
                ->sortByDesc('created_at')
                ->map(function ($loan) {
                    $multiplier = $this->getInterestMultiplier($loan);
                    $totalWithInterest = round($loan->amount * $multiplier, 2);
                    $paid = DB::table('payments')->where('loan_id', $loan->id)->sum('amount');
                    return [
                        'id' => $loan->id,
                        'status' => $loan->status,
                        'amount_paid' => $paid,
                        'due_date' => $loan->due_date,
                        'paid_at' => $loan->paid_at,
                        'next_due_payment' => $loan->due_date,
                    ];
                })
                ->values();

            return Inertia::render('Dashboard', [
                'auth' => ['user' => $user],
                'userLoans' => [
                    'totalLoan' => $totalWithInterest,
                    'amountPaid' => $amountPaid,
                    'amountLeft' => $amountLeft,
                    'status' => $activeLoan->status,
                    'nextDueDate' => $nextDueDate,
                    'nextPaymentAmount' => $nextPaymentAmount,
                    'daysRemaining' => $daysRemaining,
                ],
                'loanHistory' => $loanHistory,
                'userPayments' => $payments,
                'lastPayment' => $lastPayment,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Dashboard load failed', [
                'user' => Auth::user()?->email,
                'role' => Auth::user()?->role,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('dashboard')
                ->with('error', '⚠️ Something went wrong while loading your dashboard. Please try again.');
        }
    }

    /**
     * 🧮 Helper - determine multiplier
     */
    private function getInterestMultiplier($loan)
    {
        $multipliers = [
            1 => 1.20,
            2 => 1.31,
            3 => 1.425,
            4 => 1.56,
            5 => 1.67,
            6 => 1.83,
        ];
        return $multipliers[$loan->term_months] ?? (1 + ($loan->interest_rate ?? 0) / 100);
    }

    /**
     * 📊 Chart API - Loans per month (PostgreSQL safe)
     */
    public function getLoansByYear()
    {
        try {
            $year = request('year', now()->year);
            $connection = config('database.default');

            if ($connection === 'pgsql') {
                $rows = Loan::selectRaw("EXTRACT(MONTH FROM created_at) AS month_key, COUNT(*) AS cnt")
                    ->whereRaw("EXTRACT(YEAR FROM created_at) = ?", [$year])
                    ->groupBy('month_key')
                    ->pluck('cnt', 'month_key');
            } elseif ($connection === 'sqlite') {
                $rows = Loan::selectRaw("strftime('%m', created_at) AS month_key, COUNT(*) AS cnt")
                    ->whereRaw("strftime('%Y', created_at) = ?", [$year])
                    ->groupBy('month_key')
                    ->pluck('cnt', 'month_key');
            } else {
                $rows = Loan::selectRaw("MONTH(created_at) AS month_key, COUNT(*) AS cnt")
                    ->whereYear('created_at', $year)
                    ->groupBy('month_key')
                    ->pluck('cnt', 'month_key');
            }

            $result = [];
            for ($m = 1; $m <= 12; $m++) {
                $key = str_pad((string) $m, 2, '0', STR_PAD_LEFT);
                $result[$key] = (int) ($rows[$key] ?? 0);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('❌ Chart load failed', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }
}