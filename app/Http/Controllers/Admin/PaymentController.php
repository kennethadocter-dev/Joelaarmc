<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Loan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoanCompletedMail;
use App\Helpers\ActivityLogger;
use App\Helpers\SmsNotifier;

class PaymentController extends Controller
{
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** 📋 List all payments */
    public function index(Request $request)
    {
        try {
            $query = Payment::with(['loan.customer', 'receivedByUser'])
                ->orderByDesc('paid_at');

            if ($request->filled('client')) {
                $query->whereHas('loan.customer', function ($q) use ($request) {
                    $q->where('full_name', 'like', '%' . $request->client . '%');
                });
            }

            $payments = $query->get();

            return Inertia::render('Admin/Payments/Index', [
                'payments' => $payments,
                'auth'     => ['user' => auth()->user()],
                'flash'    => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load payment list.');
        }
    }

    /** 📝 Create new payment form */
    public function create(Request $request)
    {
        try {
            $loanId = $request->query('loan_id');
            $loan = Loan::with('customer')->find($loanId);

            if (!$loan) {
                return redirect()->route($this->basePath() . '.loans.index')
                    ->with('error', '⚠️ Please select a valid loan first.');
            }

            return Inertia::render('Admin/Payments/Create', [
                'loan' => $loan,
                'auth' => ['user' => auth()->user()],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to open payment form.');
        }
    }

    /** 💾 Store a new payment + send SMS + email */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'loan_id'   => 'required|exists:loans,id',
                'amount'    => 'required|numeric|min:1',
                'paid_at'   => 'required|date',
                'reference' => 'nullable|string|max:255',
                'note'      => 'nullable|string|max:500',
            ]);

            $loan = Loan::with('customer')->findOrFail($validated['loan_id']);

            $totalWithInterest = $loan->amount + ($loan->amount * ($loan->interest_rate ?? 0) / 100);
            $alreadyPaid = Payment::where('loan_id', $loan->id)->sum('amount');
            $remaining = max($totalWithInterest - $alreadyPaid, 0);

            if ($validated['amount'] > $remaining + 0.009) {
                $allowed = number_format($remaining, 2);
                return back()->with('error', "⚠️ Only ₵{$allowed} remaining for this loan.");
            }

            DB::beginTransaction();

            $payment = Payment::create([
                'loan_id'        => $loan->id,
                'received_by'    => auth()->id(),
                'amount'         => $validated['amount'],
                'paid_at'        => $validated['paid_at'],
                'payment_method' => 'cash',
                'reference'      => $validated['reference'] ?? null,
                'note'           => $validated['note'] ?? null,
            ]);

            // Update loan progress
            $loan->increment('amount_paid', $validated['amount']);
            $loan->decrement('amount_remaining', $validated['amount']);

            // Mark loan as paid if completed
            if ($loan->amount_remaining <= 0.01) {
                $loan->update(['status' => 'paid', 'amount_remaining' => 0]);
            }

            DB::commit();

            // 📨 SMS: Notify payment
            if (!empty($loan->customer?->phone)) {
                $remainingBalance = max($loan->amount_remaining, 0);
                $msg = "Hi {$loan->customer->full_name}, we've received your payment of ₵" .
                    number_format($validated['amount'], 2) .
                    ". Remaining balance: ₵" . number_format($remainingBalance, 2) .
                    ". Thank you!";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            // 🏁 If loan fully paid, send final Email + SMS
            if ($loan->status === 'paid') {
                ActivityLogger::log('Completed Loan', "Loan #{$loan->id} marked as fully paid automatically.");

                // ✅ Send congratulation email if email exists
                if (!empty($loan->customer?->email)) {
                    Mail::to($loan->customer->email)->send(new LoanCompletedMail($loan));
                }

                // ✅ Send SMS
                if (!empty($loan->customer?->phone)) {
                    $msg = "🎉 Congratulations {$loan->customer->full_name}! Your loan of ₵" .
                        number_format($loan->amount, 2) .
                        " is now fully paid off. Thank you for being a valued Joelaar customer!";
                    SmsNotifier::send($loan->customer->phone, $msg);
                }
            }

            ActivityLogger::log('Created Payment', "Payment of ₵{$validated['amount']} recorded for loan #{$loan->id}");

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Payment recorded successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->handleError($e, '⚠️ Failed to record payment.');
        }
    }

    /** 🧾 Show payment details */
    public function show(Payment $payment)
    {
        try {
            $payment->load(['loan.customer', 'receivedByUser']);
            return Inertia::render('Admin/Payments/Show', [
                'payment' => $payment,
                'auth' => ['user' => auth()->user()],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load payment details.');
        }
    }

    /** 🧰 Unified error handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ PaymentController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.loans.index')
            ->with('error', $message);
    }
}