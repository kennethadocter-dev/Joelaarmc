<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\Setting;

class AccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $plainPassword;
    public $settings;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $plainPassword)
    {
        $this->user = $user;
        $this->plainPassword = $plainPassword;
        $this->settings = Setting::first(); // 🔄 Pull current company info
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
            ->subject("🎉 Welcome to {$companyName} — Your Account Details")
            ->markdown('emails.account_created')
            ->with([
                'name'        => $this->user->name,
                'email'       => $this->user->email,
                'password'    => $this->plainPassword,
                'loginUrl'    => url('/login'),
                'companyName' => $companyName,
                'companyEmail'=> $companyEmail,
                'companyPhone'=> $this->settings->phone ?? '+233000000000',
                'companyAddress' => $this->settings->address ?? 'Accra, Ghana',
            ]);
    }
}