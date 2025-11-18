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

    /** Show Record Cash Payment page */
    public function create(Request $request)
    {
        try {
            $loanId = $request->query('loan_id');
            if (!$loanId) {
                return back()->with('error', 'Missing loan ID.');
            }

            $loan = Loan::with('customer')->findOrFail($loanId);

            return Inertia::render('Admin/Payments/RecordPayment', [
                'loan'           => $loan,
                'expectedAmount' => $loan->amount_remaining ?? 0,
                'redirect'       => $request->query('redirect'),
                'auth'           => ['user' => auth()->user()],
                'basePath'       => $this->basePath(),
                'flash'          => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->debugError($e, '⚠️ Unable to load Cash Payment page.');
        }
    }

    /** Store cash payment safely (duplicate-proof) */
    public function store(Request $request)
    {
        try {
            Log::info('🧾 Payment Debug Start', [
                'incoming_data' => $request->all(),
                'user_id'       => auth()->id(),
            ]);

            if (!$request->has('loan_id') && $request->route('loan')) {
                $request->merge(['loan_id' => $request->route('loan')]);
            }

            $validated = $request->validate([
                'loan_id' => 'required|exists:loans,id',
                'amount'  => 'required|numeric|min:1',
                'note'    => 'nullable|string|max:500',
            ]);

            $loan   = Loan::with(['customer', 'loanSchedules'])->findOrFail($validated['loan_id']);
            $userId = auth()->id() ?? 1;
            $amount = floatval($validated['amount']);

            /** Idempotency Hash — prevents double-tap */
            $hash = md5($loan->id . '|' . $amount . '|' . now()->format('YmdHis'));

            DB::beginTransaction();

            $existing = Payment::where('idempotency_key', $hash)->first();
            if ($existing) {
                DB::rollBack();

                Log::warning('⚠️ Duplicate payment attempt blocked', [
                    'loan_id' => $loan->id,
                    'user_id' => $userId,
                    'hash'    => $hash,
                ]);

                return redirect()
                    ->route($this->basePath() . '.loans.show', $loan->id)
                    ->with('success', '⚠️ Duplicate payment ignored.');
            }

            $payment = Payment::firstOrCreate(
                ['idempotency_key' => $hash],
                [
                    'loan_id'        => $loan->id,
                    'received_by'    => $userId,
                    'amount'         => $amount,
                    'paid_at'        => now(),
                    'payment_method' => 'cash',
                    'reference'      => 'CASH-' . now()->timestamp,
                    'note'           => $validated['note'] ?? 'Cash payment recorded',
                ]
            );

            if ($payment->wasRecentlyCreated) {
                // Distribute payment across loan schedules
                $this->applyPaymentToLoan($loan, $amount);
            }

            DB::commit();

            ActivityLogger::log('Cash Payment', "₵{$amount} recorded for Loan #{$loan->id}");

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Cash payment recorded successfully!');

        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('❌ Cash Payment Error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return back()->with('error', '⚠️ Payment failed: ' . $e->getMessage());
        }
    }

    /** Apply payment to loan schedule (no DB transaction here; caller handles it) */
    private function applyPaymentToLoan(Loan $loan, float $amount): void
    {
        $remaining = round($amount, 2);

        $schedules = $loan->loanSchedules()
            ->where(function ($q) {
                $q->where('is_paid', false)->orWhereNull('is_paid');
            })
            ->orderBy('payment_number')
            ->lockForUpdate()
            ->get();

        foreach ($schedules as $schedule) {
            if ($remaining <= 0) {
                break;
            }

            $balance = round(max(0, $schedule->amount - $schedule->amount_paid), 2);
            if ($balance <= 0) {
                continue;
            }

            $applied = min($remaining, $balance);
            $schedule->amount_paid += $applied;
            $schedule->amount_left = max(0, round($schedule->amount - $schedule->amount_paid, 2));
            $schedule->is_paid     = $schedule->amount_left <= 0.01;
            $schedule->note        = $schedule->is_paid
                ? "Installment fully paid on " . now()->format('Y-m-d')
                : "Partial payment on " . now()->format('Y-m-d');

            $schedule->save();

            $remaining -= $applied;
        }

        Log::info('💰 Payment applied to loan schedules', [
            'loan_id'            => $loan->id,
            'original_amount'    => $amount,
            'unapplied_remaining'=> $remaining,
        ]);

        // 📌 We do NOT touch loan totals here.
        // Loan totals are recalculated via Payment model events using Loan::recalculateSummary().
    }

    /** Debug output */
    private function debugError(\Throwable $e, string $msg)
    {
        Log::error('❌ PaymentController Error', [
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
        ]);

        return response()->make("
            <h2 style='color:red'>⚠️ {$msg}</h2>
            <p><strong>{$e->getMessage()}</strong></p>
        ", 500);
    }
}