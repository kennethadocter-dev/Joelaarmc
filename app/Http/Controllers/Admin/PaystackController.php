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

class PaystackController extends Controller
{
    /**
     * 🔹 Step 1: Initialize a payment (redirect user to Paystack checkout)
     */
    public function initialize(Request $request)
    {
        try {
            $validated = $request->validate([
                'email'    => 'required|email',
                'amount'   => 'required|numeric|min:1',
                'loan_id'  => 'nullable|integer',
                'method'   => 'nullable|string',
            ]);

            $amountInKobo = $validated['amount'] * 100;

            // Dynamically set callback route
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
                    'loan_id' => $validated['loan_id'] ?? null,
                    'method'  => $validated['method'] ?? 'card',
                ],
            ]);

            $data = $response->json();

            if (isset($data['status']) && $data['status'] === true) {
                Log::info('✅ Paystack initialized successfully', ['email' => $validated['email'], 'loan' => $validated['loan_id']]);
                return redirect($data['data']['authorization_url']);
            }

            Log::error('❌ Paystack initialization failed', ['response' => $data]);
            return back()->with('error', '⚠️ Payment initialization failed. Please try again.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Payment initialization failed.');
        }
    }

    /**
     * 🔹 Step 2: Callback after successful or failed payment
     */
    public function callback(Request $request)
    {
        try {
            $reference = $request->query('reference');

            if (!$reference) {
                return redirect()->back()->with('error', '❌ Missing payment reference.');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->get(env('PAYSTACK_PAYMENT_URL') . '/transaction/verify/' . $reference);

            $data = $response->json();

            if (!isset($data['data']['status']) || $data['data']['status'] !== 'success') {
                Log::warning('⚠️ Paystack verification failed', ['response' => $data]);
                return redirect()->back()->with('error', '❌ Payment verification failed.');
            }

            $loanId     = $data['data']['metadata']['loan_id'] ?? null;
            $amountPaid = $data['data']['amount'] / 100;
            $method     = $data['data']['channel'] ?? 'Paystack';

            if (!$loanId) {
                Log::error('❌ No loan ID in metadata', ['data' => $data]);
                return redirect()->back()->with('error', '⚠️ Loan reference missing in transaction.');
            }

            // Prevent duplicate Paystack callbacks
            if (Payment::where('reference', $reference)->exists()) {
                Log::info('⚠️ Duplicate Paystack callback ignored', ['reference' => $reference]);
                return redirect()->route($this->loanRoute(), ['loan' => $loanId])
                    ->with('info', 'ℹ️ Payment already processed.');
            }

            // Record payment
            $payment = Payment::create([
                'loan_id'        => $loanId,
                'amount'         => $amountPaid,
                'paid_at'        => now(),
                'payment_method' => $method,
                'reference'      => $reference,
                'note'           => 'Payment processed via Paystack',
            ]);

            $loan = Loan::find($loanId);
            if ($loan) {
                $loan->amount_paid      = ($loan->amount_paid ?? 0) + $amountPaid;
                $loan->amount_remaining = max(0, ($loan->amount_remaining ?? 0) - $amountPaid);
                if ($loan->amount_remaining <= 0) {
                    $loan->status = 'paid';
                }
                $loan->save();

                // Update next unpaid schedule
                $schedule = $loan->loanSchedules()->where('is_paid', false)->orderBy('payment_number')->first();
                if ($schedule) {
                    if ($amountPaid >= $schedule->amount) {
                        $schedule->is_paid = true;
                        $schedule->paid_at = now();
                    } else {
                        $schedule->note = 'Partially paid ₵' . number_format($amountPaid, 2);
                    }
                    $schedule->save();
                }

                // Send receipt + SMS
                $this->sendReceiptAndSms($loan, $payment, $amountPaid, $reference);
            } else {
                Log::error('⚠️ Loan not found', ['loan_id' => $loanId]);
            }

            Log::info('✅ Paystack payment recorded', [
                'loan_id'   => $loanId,
                'reference' => $reference,
                'amount'    => $amountPaid,
            ]);

            return redirect()
                ->route($this->loanRoute(), ['loan' => $loanId])
                ->with('success', '✅ Payment successful via Paystack. Receipt and SMS confirmation sent.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to process Paystack callback.');
        }
    }

    /**
     * 📩 Send email receipt + SMS confirmation
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
                $smsMessage = "Hello {$loan->client_name}, your payment of ₵" . number_format($amountPaid, 2) .
                    " has been received. Ref: {$reference}. Thank you for paying promptly. - " . config('app.name');

                $response = Http::withHeaders([
                    'api-key' => env('ARKESEL_API_KEY'),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post('https://sms.arkesel.com/api/v2/sms/send', [
                    'sender' => env('ARKESEL_SENDER_ID', config('app.name')),
                    'message' => $smsMessage,
                    'recipients' => [$loan->customer->phone],
                ]);

                Log::info('✅ SMS payment confirmation sent', [
                    'phone' => $loan->customer->phone,
                    'response' => $response->json(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send payment receipt or SMS', ['error' => $e->getMessage()]);
        }
    }

    /**
     * 🔧 Helper: Detect correct loan route prefix based on user role
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
     * 🧰 Unified Safe Error Handler
     */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        if ($user && strtolower($user->role ?? '') === 'superadmin') {
            throw $e; // allow debugging for superadmin
        }

        Log::error('❌ PaystackController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return back()->with('error', $message);
    }
}