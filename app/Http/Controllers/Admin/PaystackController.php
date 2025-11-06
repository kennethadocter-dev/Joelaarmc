<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\Payment;
use App\Models\Loan;
use App\Mail\PaymentReceiptMail;
use PDF;
use Carbon\Carbon;

/**
 * 💳 Handles all Paystack payment processing:
 * initialization, callback verification, receipts, and loan updates.
 */
class PaystackController extends Controller
{
    /**
     * 💳 Step 1: Initialize Paystack Payment
     */
    public function initialize(Request $request)
    {
        try {
            $validated = $request->validate([
                'email'    => 'required|email',
                'amount'   => 'required|numeric|min:1',
                'loan_id'  => 'nullable|integer|exists:loans,id',
                'method'   => 'nullable|string',
            ]);

            $amountInKobo = $validated['amount'] * 100;

            $callbackRoute = match (true) {
                auth()->user()?->is_super_admin,
                auth()->user()?->role === 'superadmin' => 'superadmin.paystack.callback',
                default => 'admin.paystack.callback',
            };

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
                'Content-Type'  => 'application/json',
            ])->post(env('PAYSTACK_PAYMENT_URL') . '/transaction/initialize', [
                'email'        => $validated['email'],
                'amount'       => $amountInKobo,
                'callback_url' => route($callbackRoute),
                'metadata'     => [
                    'loan_id'      => $validated['loan_id'] ?? null,
                    'method'       => $validated['method'] ?? 'card',
                    'initiated_by' => auth()->user()?->name ?? 'System',
                ],
            ]);

            $data = $response->json();

            if (isset($data['status']) && $data['status'] === true) {
                Log::info('✅ Paystack initialized successfully', [
                    'email'     => $validated['email'],
                    'loan_id'   => $validated['loan_id'] ?? 'N/A',
                    'reference' => $data['data']['reference'] ?? 'N/A',
                ]);

                return redirect($data['data']['authorization_url']);
            }

            Log::error('❌ Paystack initialization failed', ['response' => $data]);
            return back()->with('error', '⚠️ Unable to initialize payment. Please try again.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Payment initialization failed.');
        }
    }

    /**
     * 🔁 Step 2: Handle Paystack Callback (Verification)
     */
    public function callback(Request $request)
    {
        try {
            $reference = $request->query('reference');

            if (!$reference) {
                return redirect()->back()->with('error', '❌ Missing payment reference.');
            }

            $verifyResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->get(env('PAYSTACK_PAYMENT_URL') . '/transaction/verify/' . $reference);

            $data = $verifyResponse->json();

            if (!isset($data['data']['status']) || $data['data']['status'] !== 'success') {
                Log::warning('⚠️ Paystack verification failed', ['response' => $data]);
                return redirect()->back()->with('error', '❌ Payment verification failed.');
            }

            $loanId        = $data['data']['metadata']['loan_id'] ?? null;
            $amountPaid    = $data['data']['amount'] / 100;
            $method        = $data['data']['channel'] ?? 'Paystack';
            $customerEmail = $data['data']['customer']['email'] ?? null;

            if (!$loanId) {
                Log::error('❌ No loan ID in metadata', ['data' => $data]);
                return redirect()->back()->with('error', '⚠️ Loan reference missing in transaction.');
            }

            if (Payment::where('reference', $reference)->exists()) {
                Log::info('⚠️ Duplicate Paystack callback ignored', ['reference' => $reference]);
                return redirect()->route($this->loanRoute(), ['loan' => $loanId])
                    ->with('info', 'ℹ️ Payment already processed.');
            }

            // ✅ Create payment record
            $payment = Payment::create([
                'loan_id'        => $loanId,
                'amount'         => $amountPaid,
                'paid_at'        => now(),
                'payment_method' => $method,
                'reference'      => $reference,
                'note'           => 'Processed via Paystack',
                'received_by'    => auth()->id() ?? null,
            ]);

            $loan = Loan::with('loanSchedules', 'customer')->find($loanId);
            if ($loan) {
                $loan->amount_paid += $amountPaid;
                $loan->amount_remaining = max(0, $loan->amount_remaining - $amountPaid);
                $loan->status = $loan->amount_remaining <= 0.01 ? 'paid' : 'active';
                $loan->save();

                // 🔁 Distribute across schedules
                $remainingPayment = $amountPaid;
                foreach ($loan->loanSchedules()->orderBy('payment_number')->get() as $schedule) {
                    if ($remainingPayment <= 0) break;

                    $balance = $schedule->amount_left ?? ($schedule->amount - $schedule->amount_paid);
                    if ($balance <= 0) continue;

                    if ($remainingPayment >= $balance) {
                        $schedule->amount_paid += $balance;
                        $remainingPayment -= $balance;
                    } else {
                        $schedule->amount_paid += $remainingPayment;
                        $remainingPayment = 0;
                    }

                    $schedule->amount_left = max(0, $schedule->amount - $schedule->amount_paid);
                    $schedule->is_paid = $schedule->amount_left <= 0.01;
                    $schedule->paid_at = $schedule->is_paid ? now() : null;
                    $schedule->note = $schedule->is_paid ? 'Fully paid' : 'Partially paid';
                    $schedule->save();
                }

                $this->sendReceiptAndSms($loan, $payment, $amountPaid, $reference);
            }

            Log::info('✅ Paystack payment recorded', [
                'loan_id'   => $loanId,
                'reference' => $reference,
                'amount'    => $amountPaid,
            ]);

            return redirect()
                ->route($this->loanRoute(), ['loan' => $loanId])
                ->with('success', '✅ Payment successful via Paystack! Receipt and SMS confirmation sent.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to process Paystack callback.');
        }
    }

    /**
     * 📩 Send payment receipt email + SMS
     */
    private function sendReceiptAndSms($loan, $payment, $amountPaid, $reference)
    {
        try {
            $pdf = PDF::loadView('emails.payment_receipt', [
                'loan'     => $loan,
                'payment'  => $payment,
                'customer' => $loan->customer,
            ]);

            if (!empty($loan->customer->email)) {
                Mail::to($loan->customer->email)
                    ->send(new PaymentReceiptMail($loan, $payment, $pdf->output()));
            }

            if (!empty($loan->customer->phone)) {
                $smsMessage = "Hi {$loan->client_name}, your payment of ₵" .
                    number_format($amountPaid, 2) .
                    " has been received. Ref: {$reference}. Thank you! - " . config('app.name');

                $response = Http::withHeaders([
                    'api-key' => env('ARKESEL_SMS_API_KEY'),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post('https://sms.arkesel.com/api/v2/sms/send', [
                    'sender' => env('ARKESEL_SMS_SENDER_ID', config('app.name')),
                    'message' => $smsMessage,
                    'recipients' => [$loan->customer->phone],
                ]);

                Log::info('✅ Payment SMS sent', [
                    'phone' => $loan->customer->phone,
                    'response' => $response->json(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send payment receipt or SMS', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 🔧 Helper: Detect correct route prefix for loans
     */
    private function loanRoute(): string
    {
        return match (true) {
            auth()->user()?->is_super_admin,
            auth()->user()?->role === 'superadmin' => 'superadmin.loans.show',
            default => 'admin.loans.show',
        };
    }

    /**
     * 🧰 Centralized error handler
     */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ PaystackController Error', [
            'user'  => $user?->email ?? 'system',
            'route' => request()->path(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        if ($user && strtolower($user->role ?? '') === 'superadmin') {
            throw $e;
        }

        return back()->with('error', $message);
    }
}