<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;

class CustomerWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $customer;

    public function __construct(Customer $customer)
    {
        $this->customer = $customer;
    }

    public function build()
    {
        return $this->subject('Welcome to Joelaar Micro-Credit')
                    ->from(config('mail.from.address'), config('mail.from.name'))
                    ->view('emails.customer_welcome')
                    ->with(['customer' => $this->customer]);
    }
}