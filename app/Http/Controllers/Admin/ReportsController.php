<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Setting;
use App\Models\EmailFailure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\LoanAgreementMail;
use App\Helpers\ActivityLogger;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /** 
     * 🔧 Detect active panel (admin or superadmin)
     * IMPORTANT: folder names are lowercase → "admin" / "superadmin"
     */
    private function basePath(): string
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** 📊 Reports Dashboard (Admin + Superadmin shared controller) */
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
                $multipliers = [
                    1 => 1.20,
                    2 => 1.31,
                    3 => 1.425,
                    4 => 1.56,
                    5 => 1.67,
                    6 => 1.83,
                ];
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

            // Totals
            $allLoans = Loan::all();
            $principal_disbursed = $allLoans->sum('amount');

            $interest_expected = $allLoans->sum(function ($loan) {
                $multipliers = [
                    1 => 1.20,
                    2 => 1.31,
                    3 => 1.425,
                    4 => 1.56,
                    5 => 1.67,
                    6 => 1.83,
                ];
                $multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate / 100);
                return ($loan->amount * $multiplier) - $loan->amount;
            });

            $interest_earned = Loan::where('status', 'paid')->get()->sum(function ($loan) {
                $multipliers = [
                    1 => 1.20,
                    2 => 1.31,
                    3 => 1.425,
                    4 => 1.56,
                    5 => 1.67,
                    6 => 1.83,
                ];
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

            $failures = EmailFailure::latest()->take(10)->get();

            ActivityLogger::log('Viewed Reports', 'Reports dashboard viewed by ' . auth()->user()->name);

            return Inertia::render(
                $this->basePath() . '/Reports/Index', // ⭐ CORRECT NOW
                [
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
                    'flash'    => [
                        'success' => session('success'),
                        'error'   => session('error'),
                    ],
                ]
            );
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load reports.');
        }
    }

    /** 📑 Single Loan Report */
    public function show($loanId)
    {
        try {
            $loan = Loan::with(['customer', 'guarantors', 'payments', 'user'])->findOrFail($loanId);

            $settings = Setting::first();
            $today = Carbon::now();

            $agreementLine =
                "THIS LOAN AGREEMENT is made at {$settings->company_name} office on the " .
                $today->format('jS') . " day of " . $today->format('F') . " " . $today->format('Y') .
                " between {$settings->company_name} (Lender) and {$loan->client_name} (Borrower).";

            ActivityLogger::log('Viewed Loan Report', "Loan #{$loan->id} viewed by " . auth()->user()->name);

            return Inertia::render(
                $this->basePath() . '/Reports/Show', // ⭐ CORRECT NOW
                [
                    'loan'           => $loan,
                    'guarantors'     => $loan->guarantors,
                    'csrf_token'     => csrf_token(),
                    'agreement_line' => $agreementLine,
                    'settings'       => $settings,
                    'auth'           => ['user' => auth()->user()],
                    'basePath'       => $this->basePath(),
                    'flash'          => [
                        'success' => session('success'),
                        'error'   => session('error'),
                    ],
                ]
            );
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load loan report.');
        }
    }


    /** 📤 Email Agreement */
    public function sendAgreement($loanId)
    {
        try {
            $loan = Loan::with(['customer', 'guarantors', 'user'])->findOrFail($loanId);

            if (!$loan->customer || empty($loan->customer->email)) {
                return back()->with('error', '⚠️ Customer has no email.');
            }

            $pdf = Pdf::loadView('loan_agreement_pdf', ['loan' => $loan])->setPaper('A4');
            $pdf->output();

            Mail::to($loan->customer->email)->send(new LoanAgreementMail($loan));

            ActivityLogger::log('Sent Loan Agreement', "Loan #{$loan->id} sent to {$loan->customer->email}");

            return back()->with('success', '📧 Loan agreement sent.');
        } catch (\Throwable $e) {

            EmailFailure::create([
                'recipient'     => $loan->customer->email ?? 'unknown',
                'subject'       => "Loan Agreement - {$loan->client_name}",
                'loan_id'       => $loan->id ?? null,
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Loan Agreement Email Failed', [
                'loan_id' => $loan->id ?? null,
                'error'   => $e->getMessage(),
            ]);

            return back()->with('error', '⚠️ Email failed to send.');
        }
    }

    /** 🧹 Clear all email failure logs */
    public function clearEmailFailures()
    {
        try {
            EmailFailure::truncate();

            ActivityLogger::log('Cleared Email Failures', auth()->user()->name . ' cleared all failures.');

            return back()->with('success', '🧹 All failures cleared.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Could not clear email failures.');
        }
    }

    /** 🧰 Central error handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ ReportsController Error', [
            'user'  => auth()->user()?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.reports.index')
            ->with('error', $message);
    }
}