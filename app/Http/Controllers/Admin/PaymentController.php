<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Loan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\ActivityLogger;
use App\Helpers\SmsNotifier; // 📲 SMS ADDED

class PaymentController extends Controller
{
    /** Determine base route prefix */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** List all payments */
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

            return Inertia::render('Admin/Payments/Index', [
                'payments' => $query->get(),
                'auth'     => ['user' => auth()->user()],
                'flash'    => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->debugError($e, '⚠️ Failed to load payment list.');
        }
    }

    /** Record a new cash payment */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'loan_id' => 'required|exists:loans,id',
                'amount'  => 'required|numeric|min:1',
                'note'    => 'nullable|string|max:500',
            ]);

            $loan = Loan::with('loanSchedules', 'customer')->findOrFail($validated['loan_id']);
            $amount = floatval($validated['amount']);
            $userId = auth()->id();

            /** REAL idempotency — allows safe single-click */
            $hash = md5($loan->id . '|' . $amount . '|' . $userId . '|' . now()->format('YmdHi'));

            DB::beginTransaction();

            /** Prevent exact duplicate within same minute */
            $exists = Payment::where('idempotency_key', $hash)->first();
            if ($exists) {
                DB::rollBack();
                return back()->with('success', '⚠️ Duplicate payment blocked.');
            }

            /** 1️⃣ Create payment */
            $payment = Payment::create([
                'loan_id'        => $loan->id,
                'received_by'    => $userId,
                'amount'         => $amount,
                'paid_at'        => now(),
                'payment_method' => 'cash',
                'idempotency_key'=> $hash,
                'reference'      => 'CASH-' . now()->timestamp,
                'note'           => $validated['note'] ?? null,
            ]);

            /** 2️⃣ Apply payment to the schedules */
            $this->applyPaymentToLoan($loan, $amount);

            /** 3️⃣ Update loan summary exactly once */
            $loan->amount_paid = $loan->payments()->sum('amount');
            $loan->amount_remaining = $loan->loanSchedules()->sum('amount_left');
            $loan->status = $loan->amount_remaining <= 0.01 ? 'paid' : 'active';
            $loan->save();

            /** 📲 SMS ADDED — Payment notification */
            if (!empty($loan->customer->phone)) {
                $sms = "Hi {$loan->customer->full_name}, payment of ₵" .
                       number_format($amount, 2) .
                       " received for your loan. Remaining balance: ₵" .
                       number_format($loan->amount_remaining, 2) . ".";
                SmsNotifier::send($loan->customer->phone, $sms);
            }

            /** 📲 SMS ADDED — If loan fully paid */
            if ($loan->amount_remaining <= 0.01 && !empty($loan->customer->phone)) {
                $msg = "🎉 Congratulations {$loan->customer->full_name}! Your loan (Code: {$loan->loan_code}) has been fully paid off. Thank you for trusting Joelaar Micro-Credit.";
                SmsNotifier::send($loan->customer->phone, $msg);
            }

            DB::commit();

            ActivityLogger::log(
                'Cash Payment',
                "₵{$amount} recorded for Loan #{$loan->id}"
            );

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Cash payment recorded successfully!');

        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', '⚠️ Payment failed: ' . $e->getMessage());
        }
    }

    /** Apply payment to loan schedules */
    private function applyPaymentToLoan(Loan $loan, float $amount)
    {
        $remaining = $amount;

        $schedules = $loan->loanSchedules()
            ->where('is_paid', false)
            ->orderBy('payment_number')
            ->lockForUpdate()
            ->get();

        foreach ($schedules as $schedule) {
            if ($remaining <= 0) break;

            $balance = $schedule->amount - $schedule->amount_paid;
            if ($balance <= 0) continue;

            $applied = min($remaining, $balance);

            $schedule->amount_paid += $applied;
            $schedule->amount_left = $schedule->amount - $schedule->amount_paid;
            $schedule->is_paid     = $schedule->amount_left <= 0.01;

            $schedule->note = $schedule->is_paid
                ? "Installment fully paid on " . now()->format('Y-m-d')
                : "Partial payment on " . now()->format('Y-m-d');

            $schedule->save();

            $remaining -= $applied;
        }
    }

    private function debugError(\Throwable $e, string $msg)
    {
        return response()->make("
            <h2 style='color:red'>{$msg}</h2>
            <p><strong>{$e->getMessage()}</strong></p>
        ", 500);
    }
}