<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Customer;
use App\Models\Setting;
use App\Models\EmailFailure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\LoanAgreementMail;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** 📊 List all loans for reports */
    public function index(Request $request)
    {
        try {
            $statusFilter = $request->query('status');
            $from = $request->query('from');
            $to = $request->query('to');

            $query = Loan::with(['customer', 'guarantors', 'user']);

            if ($statusFilter) {
                $query->where('status', $statusFilter);
            }
            if ($from) {
                $query->whereDate('created_at', '>=', $from);
            }
            if ($to) {
                $query->whereDate('created_at', '<=', $to);
            }

            $loans = $query->latest()->get()->map(function ($loan) {
                $multipliers = [1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83];
                $multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate / 100);
                $totalDue = round($loan->amount * $multiplier, 2);

                return [
                    'id'            => $loan->id,
                    'client_name'   => $loan->client_name ?: ($loan->customer?->full_name ?? '—'),
                    'amount'        => $loan->amount,
                    'interest_rate' => $loan->interest_rate,
                    'term_months'   => $loan->term_months,
                    'start_date'    => $loan->start_date,
                    'due_date'      => $loan->due_date,
                    'status'        => $loan->status,
                    'total_due'     => $totalDue,
                ];
            });

            // ✅ Totals
            $allLoans = Loan::all();
            $principal_disbursed = $allLoans->sum('amount');
            $interest_expected = $allLoans->sum(function ($loan) {
                $multipliers = [1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83];
                $multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate / 100);
                return ($loan->amount * $multiplier) - $loan->amount;
            });
            $interest_earned = Loan::where('status', 'paid')->get()->sum(function ($loan) {
                $multipliers = [1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83];
                $multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate / 100);
                return ($loan->amount * $multiplier) - $loan->amount;
            });

            $totals = [
                'principal_disbursed' => $principal_disbursed,
                'interest_expected'   => $interest_expected,
                'interest_earned'     => $interest_earned,
                'paid_loans'          => Loan::where('status', 'paid')->count(),
                'active_loans'        => Loan::whereIn('status', ['active', 'overdue'])->count(),
                'pending_loans'       => Loan::where('status', 'pending')->count(),
            ];

            // 🧠 Get recent email failures
            $failures = EmailFailure::latest()->take(10)->get();

            ActivityLogger::log('Viewed Reports', 'Reports dashboard viewed by ' . auth()->user()->name);

            return Inertia::render('Admin/Reports/Index', [
                'loans'    => $loans,
                'totals'   => $totals,
                'failures' => $failures,
                'filters'  => [
                    'status' => $statusFilter,
                    'from'   => $from,
                    'to'     => $to,
                ],
                'auth'     => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load reports.');
        }
    }

    /** 📑 Show single loan report */
    public function show($loanId)
    {
        try {
            $loan = Loan::with(['customer', 'guarantors', 'payments', 'user'])->findOrFail($loanId);
            $settings = Setting::first();

            $multipliers = [1 => 1.20, 2 => 1.31, 3 => 1.425, 4 => 1.56, 5 => 1.67, 6 => 1.83];
            $multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate / 100);
            $totalDue = round($loan->amount * $multiplier, 2);
            $monthlyPayment = round($totalDue / $loan->term_months, 2);

            $principal = $loan->amount;
            $expectedInt = $totalDue - $principal;
            $interestEarned = $loan->status === 'paid' ? $expectedInt : 0;

            $today = Carbon::now();
            $agreement_line = "THIS LOAN AGREEMENT is made at BOLGATANGA this {$today->format('jS')} day of {$today->format('F')} {$today->format('Y')} between Joelaar Micro-Credit Services (hereinafter referred to as the \"Lender\") and {$loan->client_name} (hereinafter referred to as the \"Borrower\").";

            ActivityLogger::log('Viewed Loan Report', "Report for Loan #{$loan->id} viewed by " . auth()->user()->name);

            return Inertia::render('Admin/Reports/Show', [
                'loan'          => $loan,
                'guarantors'    => $loan->guarantors,
                'settings'      => $settings,
                'agreement_line'=> $agreement_line,
                'summary'       => [
                    'principal'         => $principal,
                    'interest_expected' => $expectedInt,
                    'interest_earned'   => $interestEarned,
                    'total_due'         => $totalDue,
                    'amount_paid'       => $loan->amount_paid,
                    'amount_remaining'  => $loan->amount_remaining,
                    'monthly_payment'   => $monthlyPayment,
                ],
                'auth'     => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load loan report.');
        }
    }

    /** 📤 Send Loan Agreement Email with PDF */
    public function sendAgreement($loanId)
    {
        try {
            $loan = Loan::with(['customer', 'guarantors', 'user'])->findOrFail($loanId);

            if (!$loan->customer || empty($loan->customer->email)) {
                return back()->with('error', '⚠️ This customer does not have an email address.');
            }

            try {
                $pdf = Pdf::loadView('loan_agreement_pdf', ['loan' => $loan])->setPaper('A4');
                $pdf->output();
            } catch (\Throwable $e) {
                Log::error('❌ Failed to generate Loan Agreement PDF', [
                    'loan_id' => $loan->id,
                    'error'   => $e->getMessage(),
                ]);
                return back()->with('error', '⚠️ Could not generate the loan agreement PDF.');
            }

            try {
                Mail::to($loan->customer->email)->send(new LoanAgreementMail($loan));

                ActivityLogger::log('Sent Loan Agreement', "Loan #{$loan->id} sent to {$loan->customer->email} by " . auth()->user()->name);
                return back()->with('success', '📧 Loan agreement email sent successfully.');
            } catch (\Throwable $e) {
                EmailFailure::create([
                    'recipient'      => $loan->customer->email,
                    'subject'        => "Loan Agreement - {$loan->client_name}",
                    'loan_id'        => $loan->id,
                    'error_message'  => $e->getMessage(),
                ]);

                Log::error('📧 Loan Agreement email failed', ['loan_id' => $loan->id, 'error' => $e->getMessage()]);

                try {
                    Mail::raw("🚨 Loan Agreement email failed for {$loan->customer->email}.\n\nError: {$e->getMessage()}", function ($m) {
                        $m->to('joelaar.test@gmail.com')->subject('⚠️ Loan Agreement Email Failed - System Alert');
                    });
                } catch (\Throwable $e2) {
                    Log::error('❌ Failed to notify admin about email failure', [
                        'loan_id' => $loan->id,
                        'error'   => $e2->getMessage(),
                    ]);
                }

                return back()->with('error', '⚠️ Email could not be delivered. Admin has been notified.');
            }
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to send loan agreement.');
        }
    }

    /** 🧹 Clear all email failures manually */
    public function clearEmailFailures()
    {
        try {
            EmailFailure::truncate();
            ActivityLogger::log('Cleared Email Failures', auth()->user()->name . ' cleared all email failure logs.');
            return back()->with('success', '🧹 All email failures have been cleared.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Could not clear email failures.');
        }
    }

    /** 🧰 Unified Safe Error Handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        if ($user && strtolower($user->role ?? '') === 'superadmin') {
            throw $e;
        }

        Log::error('❌ ReportsController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.reports.index')
            ->with('error', $message);
    }
}