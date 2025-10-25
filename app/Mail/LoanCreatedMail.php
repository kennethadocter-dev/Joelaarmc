<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Loan;
use App\Models\Setting;

class LoanCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $loan;
    public $settings;

    /**
     * Create a new message instance.
     */
    public function __construct(Loan $loan)
    {
        $this->loan = $loan;
        $this->settings = Setting::first();
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $companyName = $this->settings->company_name ?? 'Joelaar Micro-Credit';
        $companyEmail = $this->settings->email ?? config('mail.from.address');
        $fromName = $this->settings->manager_name ?? $companyName;

        return $this->from($companyEmail, $fromName)
            ->subject("💰 Loan Created - {$companyName}")
            ->view('emails.loan_created')
            ->with([
                'loan'           => $this->loan,
                'client_name'    => $this->loan->client_name,
                'companyName'    => $companyName,
                'companyPhone'   => $this->settings->phone ?? '+233000000000',
                'companyEmail'   => $companyEmail,
                'companyAddress' => $this->settings->address ?? 'Accra, Ghana',
            ]);
    }
}