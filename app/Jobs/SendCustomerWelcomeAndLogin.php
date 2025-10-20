<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Mail\CustomerWelcomeMail;
use App\Mail\CustomerLoginMail;
use App\Helpers\SmsNotifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendCustomerWelcomeAndLogin implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $customer;
    protected $email;
    protected $password;

    /**
     * Create a new job instance.
     */
    public function __construct(Customer $customer, string $email, string $password)
    {
        $this->customer = $customer;
        $this->email    = $email;
        $this->password = $password;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // ✉️ Send welcome + login mails
            if ($this->customer->email) {
                Mail::to($this->customer->email)->send(new CustomerWelcomeMail($this->customer));
                Mail::to($this->customer->email)->send(new CustomerLoginMail($this->customer, $this->email, $this->password));
            }

            // 📱 Send SMS login info
            if ($this->customer->phone) {
                $msg = "🎉 Welcome {$this->customer->full_name}! Your Joelaar login is ready.\n".
                       "Email: {$this->email}\n".
                       "Password: {$this->password}\n".
                       "Login: https://joelaar.local/login";

                SmsNotifier::send($this->customer->phone, $msg);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send welcome/login notifications', [
                'error' => $e->getMessage(),
                'customer_id' => $this->customer->id,
            ]);
        }
    }
}