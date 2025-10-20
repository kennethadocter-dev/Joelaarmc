<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PaymentReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public $loan;
    public $payment;
    protected $pdfData;

    /**
     * Create a new message instance.
     */
    public function __construct($loan, $payment, $pdfData = null)
    {
        $this->loan = $loan;
        $this->payment = $payment;
        $this->pdfData = $pdfData;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        try {
            $email = $this->subject('Payment Receipt – ' . ($this->loan->client_name ?? 'Client'))
                ->view('emails.payment_receipt')
                ->with([
                    'loan'    => $this->loan,
                    'payment' => $this->payment,
                ]);

            // ✅ Attach PDF only if available
            if (!empty($this->pdfData)) {
                $email->attachData(
                    $this->pdfData,
                    'Payment_Receipt_' . ($this->loan->id ?? 'Unknown') . '.pdf',
                    ['mime' => 'application/pdf']
                );
            }

            return $email;
        } catch (\Throwable $e) {
            Log::error('❌ Failed to build PaymentReceiptMail', [
                'loan_id'   => $this->loan->id ?? null,
                'payment_id'=> $this->payment->id ?? null,
                'error'     => $e->getMessage(),
            ]);

            // ✅ Fallback: send plain text message if template fails
            return $this->subject('Payment Receipt – ' . ($this->loan->client_name ?? 'Client'))
                ->text('emails.fallback_plain_receipt')
                ->with([
                    'loan'    => $this->loan,
                    'payment' => $this->payment,
                ]);
        }
    }
}