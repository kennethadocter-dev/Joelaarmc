<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;

class CustomerCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $customer;
    public $email;
    public $password;
    public $companyName;
    public $companyPhone;
    public $companyLogo;
    public $companyUrl;
    public $loginUrl;

    public function __construct(Customer $customer, $email, $password)
    {
        $this->customer = $customer;
        $this->email = $email;
        $this->password = $password;

        // COMPANY INFO (you MUST update these!)
        $this->companyName  = config('app.name', 'Joelaar');
        $this->companyLogo  = asset('images/logo.png');
        $this->companyPhone = '+233000000000';
        $this->companyUrl   = url('/');
        $this->loginUrl     = url('/login');
    }

    public function build()
    {
        return $this->subject('Your Joelaar Login Credentials')
            ->view('emails.customer-credentials');
    }
}