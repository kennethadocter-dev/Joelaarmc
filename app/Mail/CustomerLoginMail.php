<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;

class CustomerLoginMail extends Mailable
{
    use Queueable, SerializesModels;

    public $customer;
    public $email;
    public $password;

    public function __construct(Customer $customer, $email, $password)
    {
        $this->customer = $customer;
        $this->email = $email;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject('Your Joelaar Login Details')
                    ->from(config('mail.from.address'), config('mail.from.name'))
                    ->view('emails.customer_login')
                    ->with([
                        'customer' => $this->customer,
                        'email' => $this->email,
                        'password' => $this->password,
                    ]);
    }
}