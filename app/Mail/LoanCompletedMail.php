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

    /**
     * Create a new message instance.
     */
    public function __construct(Loan $loan)
    {
        $this->loan = $loan;
        $this->settings = Setting::first(); // 👈 dynamically load company info
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
            ->subject("🎉 Congratulations! Your Loan with {$companyName} is Fully Paid")
            ->view('emails.loan_completed')
            ->with([
                'loan'            => $this->loan,
                'client_name'     => $this->loan->client_name,
                'amount'          => number_format($this->loan->amount, 2),
                'companyName'     => $companyName,
                'companyEmail'    => $companyEmail,
                'companyPhone'    => $this->settings->phone ?? '+233000000000',
                'companyAddress'  => $this->settings->address ?? 'Accra, Ghana',
                'loginUrl'        => url('/login'),
            ]);
    }
}