<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Loan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Helpers\ActivityLogger;
use App\Helpers\SmsNotifier;

class PaymentController extends Controller
{
    /** 🔧 Determine current base route prefix */
    private function basePath()
    {
        $u = auth()->user();
        if (!$u) {
            Log::warning('⚠️ basePath() called with no authenticated user');
            return 'admin';
        }

        return ($u->is_super_admin || $u->role === 'superadmin')
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
                'auth' => ['user' => auth()->user()],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->showDebugError($e, '⚠️ Failed to load payment list.');
        }
    }

    /** 💵 Store cash payment from loan show */
    public function store(Request $request)
    {
        try {
            Log::info('🧾 Payment Debug Start', [
                'incoming_data' => $request->all(),
                'route_params'  => $request->route()->parameters(),
                'user_id'       => auth()->id(),
                'env'           => app()->environment(),
                'url'           => config('app.url'),
            ]);

            // ✅ Handle both /loans/{loan}/record-payment and /payments/store
            if (!$request->has('loan_id') && $request->route('loan')) {
                $request->merge(['loan_id' => $request->route('loan')]);
            }

            $validated = $request->validate([
                'loan_id' => 'required|exists:loans,id',
                'amount'  => 'required|numeric|min:1',
                'note'    => 'nullable|string|max:500',
            ]);

            DB::beginTransaction();

            $loan = Loan::with(['customer', 'loanSchedules'])->findOrFail($validated['loan_id']);

            // ✅ Fallback user ID in case auth()->id() is null (Render session loss)
            $userId = auth()->id() ?? 1;

            // 💾 Create Payment record
            $payment = Payment::create([
                'loan_id'        => $loan->id,
                'received_by'    => $userId,
                'amount'         => $validated['amount'],
                'paid_at'        => now(),
                'payment_method' => 'cash',
                'reference'      => 'CASH-' . now()->timestamp,
                'note'           => $validated['note'] ?? 'Cash payment recorded',
            ]);

            Log::info('✅ Payment created successfully', ['payment_id' => $payment->id]);

            // 🔄 Apply payment to loan schedules
            $this->applyPaymentToLoan($loan, $validated['amount']);
            DB::commit();

            ActivityLogger::log('Cash Payment', "₵{$validated['amount']} recorded for Loan #{$loan->id}");

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', '✅ Cash payment recorded successfully!');
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('❌ Cash Payment Error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return back()->with('error', '⚠️ Payment failed: ' . $e->getMessage());
        }
    }

    /** 💳 Initialize Paystack Payment (for future use) */
    public function initialize(Request $request)
    {
        try {
            $validated = $request->validate([
                'email'   => 'required|email',
                'amount'  => 'required|numeric|min:1',
                'loan_id' => 'nullable|exists:loans,id',
                'method'  => 'nullable|string',
            ]);

            $amountInKobo = $validated['amount'] * 100;

            $callbackRoute = match (true) {
                auth()->user()?->is_super_admin,
                auth()->user()?->role === 'superadmin' => 'superadmin.paystack.callback',
                default => 'admin.paystack.callback',
            };

            $callbackUrl = route($callbackRoute, [], true);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
                'Content-Type'  => 'application/json',
            ])->post(
                env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co') . '/transaction/initialize',
                [
                    'email'        => $validated['email'],
                    'amount'       => $amountInKobo,
                    'callback_url' => $callbackUrl,
                    'metadata'     => [
                        'loan_id'      => $validated['loan_id'] ?? null,
                        'initiated_by' => auth()->user()?->name ?? 'System',
                        'method'       => $validated['method'] ?? 'paystack',
                        'environment'  => app()->environment(),
                        'app_url'      => config('app.url'),
                    ],
                ]
            );

            $data = $response->json();

            if (isset($data['status']) && $data['status'] === true && isset($data['data']['authorization_url'])) {
                return response()->json([
                    'redirect_url' => $data['data']['authorization_url'],
                    'data' => $data['data'],
                ]);
            }

            Log::warning('⚠️ Paystack initialization failed', ['response' => $data]);
            return response()->json(['error' => 'Unable to initialize Paystack payment.'], 422);
        } catch (\Throwable $e) {
            return $this->showDebugError($e, '⚠️ Paystack init failed.');
        }
    }

    /** 💳 Handle Paystack callback */
    public function callback(Request $request)
    {
        try {
            $reference = $request->query('reference');
            if (!$reference) {
                return redirect()->route($this->basePath() . '.payments.index')
                    ->with('error', 'Missing payment reference.');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->get('https://api.paystack.co/transaction/verify/' . $reference);

            $data = $response->json();

            if (!isset($data['data']['status']) || $data['data']['status'] !== 'success') {
                return redirect()->route($this->basePath() . '.payments.index')
                    ->with('error', 'Payment verification failed.');
            }

            $details   = $data['data'];
            $loanId    = $details['metadata']['loan_id'] ?? null;
            $amount    = $details['amount'] / 100;
            $reference = $details['reference'];

            if (!$loanId) {
                return redirect()->route($this->basePath() . '.payments.index')
                    ->with('error', 'Missing loan ID in metadata.');
            }

            $loan = Loan::with(['customer', 'loanSchedules'])->find($loanId);
            if (!$loan) {
                return redirect()->route($this->basePath() . '.payments.index')
                    ->with('error', 'Loan not found.');
            }

            DB::beginTransaction();

            if (!Payment::where('reference', $reference)->exists()) {
                Payment::create([
                    'loan_id'        => $loan->id,
                    'received_by'    => auth()->id() ?? 1,
                    'amount'         => $amount,
                    'paid_at'        => now(),
                    'payment_method' => 'paystack',
                    'reference'      => $reference,
                    'note'           => 'Paid via Paystack',
                ]);

                $this->applyPaymentToLoan($loan, $amount);
            }

            DB::commit();

            ActivityLogger::log('Paystack Payment', "₵{$amount} paid online for Loan #{$loan->id}");

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', "✅ Payment of ₵{$amount} received via Paystack!");
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->showDebugError($e, '⚠️ Error processing Paystack payment.');
        }
    }

    /** 🧮 Apply payment to schedules */
    private function applyPaymentToLoan(Loan $loan, float $amount)
    {
        $remaining = $amount;

        foreach ($loan->loanSchedules()->orderBy('payment_number')->get() as $s) {
            if ($remaining <= 0) break;

            $balance = $s->amount_left ?? ($s->amount - $s->amount_paid);
            if ($balance <= 0) continue;

            if ($remaining >= $balance) {
                $s->amount_paid += $balance;
                $remaining -= $balance;
            } else {
                $s->amount_paid += $remaining;
                $remaining = 0;
            }

            $s->amount_left = max(0, $s->amount - $s->amount_paid);
            $s->is_paid     = $s->amount_left <= 0.01;
            $s->note        = $s->is_paid ? 'Fully paid' : 'Partially paid';
            $s->save();
        }

        $loan->amount_paid      = $loan->loanSchedules()->sum('amount_paid');
        $loan->amount_remaining = $loan->loanSchedules()->sum('amount_left');
        $loan->status           = $loan->amount_remaining <= 0.01 ? 'paid' : 'active';
        $loan->save();
    }

    /** ⚠️ Show error details (temporary debug) */
    private function showDebugError(\Throwable $e, string $msg)
    {
        Log::error('❌ PaymentController', [
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'trace'   => $e->getTraceAsString(),
        ]);

        // 👇 Return visible error page for debugging
        return response()->make("
            <h2 style='color:red'>⚠️ $msg</h2>
            <p><strong>{$e->getMessage()}</strong></p>
            <pre>{$e->getTraceAsString()}</pre>
        ", 500);
    }
}