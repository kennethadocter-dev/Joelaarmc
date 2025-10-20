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
            // 🧑‍💼 ADMIN / STAFF / SUPERADMIN DASHBOARD
            // =====================================================
            if ($role !== 'user') {
                $currentYear = now()->year;

                // 💰 Interest earned
                $interestEarned = Loan::where(DB::raw('LOWER(status)'), 'paid')
                    ->get()
                    ->sum(fn($loan) => ($loan->amount * ($loan->interest_rate ?? 0)) / 100);

                // 🧾 Pending repayment — use loan_schedules if available
                $pendingRepayment = 0;

                if (Schema::hasTable('loan_schedules')) {
                    // ✅ Sum unpaid amounts from loan_schedules
                    $pendingRepayment = DB::table('loan_schedules')
                        ->where('is_paid', 0)
                        ->sum('amount');
                } elseif (Schema::hasColumn('loans', 'amount_remaining')) {
                    // ✅ Fallback: sum from loans.amount_remaining if exists
                    $pendingRepayment = DB::table('loans')
                        ->whereIn(DB::raw('LOWER(status)'), ['active', 'overdue'])
                        ->sum('amount_remaining');
                } else {
                    // ✅ Last fallback: compute manually using payments
                    $pendingRepayment = Loan::whereIn(DB::raw('LOWER(status)'), ['active', 'overdue'])
                        ->get()
                        ->sum(function ($loan) {
                            $interestRate = is_numeric($loan->interest_rate) ? $loan->interest_rate : 0;
                            $totalWithInterest = $loan->amount + ($loan->amount * $interestRate / 100);
                            $paid = DB::table('payments')
                                ->where('loan_id', $loan->id)
                                ->sum('amount');
                            $remaining = $totalWithInterest - abs($paid ?? 0);
                            return $remaining > 0 ? round($remaining, 2) : 0;
                        });
                }

                // 🧮 Summary
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
            // 👤 NORMAL USER (CUSTOMER) DASHBOARD
            // =====================================================
            $customer = Customer::where('email', $user->email)
                ->orWhere('phone', $user->phone)
                ->with(['loans.payments' => fn($q) => $q->latest()])
                ->first();

            if (!$customer) {
                return redirect()->route('dashboard')->with('error', '⚠️ Your customer record could not be found. Please contact support.');
            }

            // 🔹 All loans belonging to this customer
            $loans = $customer->loans ?? collect();

            // 🔸 Active or latest loan
            $activeLoan = $loans->whereIn('status', ['active', 'overdue'])->first()
                ?: $loans->sortByDesc('created_at')->first();

            // 💰 Calculate total loan including interest
            if ($activeLoan) {
                $multiplier = $this->getInterestMultiplier($activeLoan);
                $totalWithInterest = round($activeLoan->amount * $multiplier, 2);
            } else {
                $totalWithInterest = 0;
            }

            // 💸 Get amount paid from payments table
            $amountPaid = $activeLoan
                ? DB::table('payments')->where('loan_id', $activeLoan->id)->sum('amount')
                : 0;

            $interestRate = $activeLoan?->interest_rate ?? 0;
            $amountLeft = $activeLoan
                ? round(($activeLoan->amount + ($activeLoan->amount * $interestRate / 100)) - abs($amountPaid ?? 0), 2)
                : 0;

            // 🕓 Last payment
            $lastPayment = $activeLoan
                ? Payment::where('loan_id', $activeLoan->id)->latest('paid_at')->first(['amount', 'paid_at', 'reference'])
                : null;

            // 📅 Next payment details
            $nextDueDate = $activeLoan?->due_date ? Carbon::parse($activeLoan->due_date) : null;
            $termMonths = $activeLoan?->term_months ?? 1;
            $nextPaymentAmount = $activeLoan
                ? round(($activeLoan->amount + ($activeLoan->amount * $interestRate / 100)) / $termMonths, 2)
                : 0;
            $daysRemaining = $nextDueDate ? now()->diffInDays($nextDueDate, false) : null;

            // 💳 Payment history (latest 10)
            $payments = $activeLoan
                ? Payment::where('loan_id', $activeLoan->id)->latest()->take(10)->get(['id', 'amount', 'paid_at', 'reference'])
                : collect();

            // 📜 Loan history (including paid ones)
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
                'auth'            => ['user' => $user],
                'userLoans'       => [
                    'totalLoan'         => $totalWithInterest,
                    'amountPaid'        => $amountPaid,
                    'amountLeft'        => $amountLeft,
                    'status'            => $activeLoan?->status ?? 'No active loan',
                    'nextDueDate'       => $nextDueDate,
                    'nextPaymentAmount' => $nextPaymentAmount,
                    'daysRemaining'     => $daysRemaining,
                ],
                'loanHistory'   => $loanHistory,
                'userPayments'  => $payments,
                'lastPayment'   => $lastPayment,
            ]);
        } catch (\Throwable $e) {
            $user = Auth::user();
            if ($user && strtolower($user->role ?? '') === 'superadmin') {
                throw $e;
            }

            Log::error('❌ Dashboard load failed', [
                'user'  => $user?->email,
                'role'  => $user?->role,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('dashboard')->with('error', '⚠️ Something went wrong while loading your dashboard. Please try again.');
        }
    }

    /**
     * 🧮 Helper - determine multiplier
     */
    private function getInterestMultiplier($loan)
    {
        $multipliers = [
            1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83,
        ];
        return $multipliers[$loan->term_months] ?? (1 + ($loan->interest_rate ?? 0) / 100);
    }

    /**
     * 📊 Chart API
     */
    public function getLoansByYear()
    {
        $year = request('year', now()->year);

        $rows = Loan::selectRaw("strftime('%m', created_at) as month_key, COUNT(*) as cnt")
            ->whereRaw("strftime('%Y', created_at) = ?", [$year])
            ->groupBy('month_key')
            ->pluck('cnt', 'month_key');

        $result = [];
        for ($m = 1; $m <= 12; $m++) {
            $key = str_pad((string)$m, 2, '0', STR_PAD_LEFT);
            $result[$key] = (int) ($rows[$key] ?? 0);
        }

        return response()->json($result);
    }
}