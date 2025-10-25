<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Loan;
use App\Models\Setting;

class LoanCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $loan;
    public $settings;

    public function __construct(Loan $loan)
    {
        $this->loan = $loan;
        $this->settings = Setting::first();
    }

    public function build()
    {
        $companyName = $this->settings->company_name ?? 'Joelaar Micro-Credit';
        $companyEmail = $this->settings->company_email ?? config('mail.from.address');
        $companyPhone = $this->settings->company_phone ?? '+233 24 609 6706';
        $companyAddress = $this->settings->company_address ?? 'Accra, Ghana';
        $companyUrl = $this->settings->company_website ?? url('/');
        $companyLogo = $this->settings->company_logo_url ?? asset('images/logo.png');
        $fromName = $this->settings->manager_name ?? $companyName;

        return $this->from($companyEmail, $fromName)
            ->subject("🎉 Congratulations! Your Loan with {$companyName} is Fully Paid")
            ->view('emails.loan_completed', [
                'loan' => $this->loan,
                'client_name' => $this->loan->client_name,
                'amount' => number_format($this->loan->amount, 2),
                'companyName' => $companyName,
                'companyEmail' => $companyEmail,
                'companyPhone' => $companyPhone,
                'companyAddress' => $companyAddress,
                'companyUrl' => $companyUrl,
                'companyLogo' => $companyLogo,
                'loginUrl' => url('/login'),
            ]);
    }
}