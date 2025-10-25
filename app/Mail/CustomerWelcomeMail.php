<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;
use App\Models\Setting;

class CustomerWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $customer;
    public $settings;

    public function __construct(Customer $customer)
    {
        $this->customer = $customer;
        $this->settings = Setting::first();
    }

    public function build()
    {
        $companyName = $this->settings->company_name ?? 'Joelaar Micro-Credit';
        $companyEmail = $this->settings->company_email ?? config('mail.from.address');
        $companyPhone = $this->settings->company_phone ?? '+233 24 609 6706';
        $companyUrl = $this->settings->company_website ?? url('/');
        $companyLogo = $this->settings->company_logo_url ?? asset('images/logo.png');

        return $this->from($companyEmail, $companyName)
            ->subject("Welcome to {$companyName} 🎉")
            ->view('emails.customer_welcome', [
                'customer' => $this->customer,
                'companyName' => $companyName,
                'companyPhone' => $companyPhone,
                'companyUrl' => $companyUrl,
                'companyLogo' => $companyLogo,
            ]);
    }
}