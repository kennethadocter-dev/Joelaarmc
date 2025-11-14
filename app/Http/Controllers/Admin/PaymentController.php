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

    /** 🆕 Show "Record Cash Payment" page */
    public function create(Request $request)
    {
        try {
            $loanId = $request->query('loan_id');
            if (!$loanId) {
                return redirect()->back()->with('error', 'Missing loan ID.');
            }

            $loan = Loan::with('customer')->findOrFail($loanId);

            return Inertia::render('Admin/Payments/RecordPayment', [
                'loan' => $loan,
                'expectedAmount' => $loan->amount_remaining ?? 0,
                'redirect' => $request->query('redirect'),
                'auth' => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->showDebugError($e, '⚠️ Unable to load Cash Payment page.');
        }
    }

    /** 💵 Store cash payment and redirect back */
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

            DB::beginTransaction();

            $loan = Loan::with(['customer', 'loanSchedules'])->findOrFail($validated['loan_id']);
            $userId = auth()->id() ?? 1;

            // 💾 Create payment record
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

            // 🔄 Apply payment to this specific loan
            $this->applyPaymentToLoan($loan, $validated['amount']);
            DB::commit();

            ActivityLogger::log('Cash Payment', "₵{$validated['amount']} recorded for Loan #{$loan->id}");

            /* 📲 SMS Notifications */
            try {
                if (!empty($loan->customer->phone)) {
                    $msg = "Hi {$loan->customer->full_name}, your payment of ₵" . number_format($validated['amount'], 2) . " has been received. Thank you!";
                    SmsNotifier::send($loan->customer->phone, $msg);
                }

                if ($loan->amount_remaining <= 0.01) {
                    $msg2 = "🎉 Hi {$loan->customer->full_name}, congratulations! Your loan has been fully paid off. We appreciate your commitment.";
                    SmsNotifier::send($loan->customer->phone, $msg2);
                }
            } catch (\Throwable $ex) {
                Log::warning('⚠️ SMS Notification Failed', ['error' => $ex->getMessage()]);
            }

            $redirectUrl = $request->input('redirect');
            if ($redirectUrl) {
                return redirect($redirectUrl)->with('success', '✅ Cash payment recorded successfully!');
            }

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

    /** 💳 Initialize Paystack Payment */
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

            /* 📲 SMS after Paystack payment */
            try {
                if (!empty($loan->customer->phone)) {
                    $msg = "Hi {$loan->customer->full_name}, your online payment of ₵" . number_format($amount, 2) . " has been received successfully!";
                    SmsNotifier::send($loan->customer->phone, $msg);
                }

                if ($loan->amount_remaining <= 0.01) {
                    $msg2 = "🎉 Hi {$loan->customer->full_name}, your loan has been fully paid off. Thank you for your trust in Joelaar Micro-Credit!";
                    SmsNotifier::send($loan->customer->phone, $msg2);
                }
            } catch (\Throwable $ex) {
                Log::warning('⚠️ SMS Notification Failed', ['error' => $ex->getMessage()]);
            }

            return redirect()
                ->route($this->basePath() . '.loans.show', $loan->id)
                ->with('success', "✅ Payment of ₵{$amount} received via Paystack!");
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->showDebugError($e, '⚠️ Error processing Paystack payment.');
        }
    }

    /** 🧮 Apply payment to next unpaid schedules safely (with rollback guard) */
    private function applyPaymentToLoan(Loan $loan, float $amount)
    {
        DB::beginTransaction();

        try {
            $remaining = round($amount, 2);

            // Load only unpaid schedules for this loan
            $schedules = $loan->loanSchedules()
                ->where(function ($q) {
                    $q->where('is_paid', false)->orWhereNull('is_paid');
                })
                ->orderBy('payment_number')
                ->lockForUpdate()
                ->get();

            foreach ($schedules as $schedule) {
                if ($remaining <= 0) break;

                $balance = round(max(0, $schedule->amount - $schedule->amount_paid), 2);
                if ($balance <= 0) continue;

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

            // Recalculate totals
            $loan->refresh();
            $loan->amount_paid      = round($loan->loanSchedules()->sum('amount_paid'), 2);
            $loan->amount_remaining = round($loan->loanSchedules()->sum('amount_left'), 2);

            // Handle rounding drift or overpayment
            if ($loan->amount_remaining <= 0.01) {
                $loan->amount_remaining = 0;
                $loan->status = 'paid';
            } else {
                $loan->status = 'active';
            }

            $loan->save();

            DB::commit();

            Log::info('💰 Payment applied successfully', [
                'loan_id' => $loan->id,
                'applied_amount' => $amount,
                'remaining_balance' => $loan->amount_remaining,
                'status' => $loan->status,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('❌ Error during payment application', [
                'loan_id' => $loan->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /** ⚠️ Show error details */
    private function showDebugError(\Throwable $e, string $msg)
    {
        Log::error('❌ PaymentController', [
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
        ]);

        return response()->make("
            <h2 style='color:red'>⚠️ $msg</h2>
            <p><strong>{$e->getMessage()}</strong></p>
        ", 500);
    }
}