<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\Setting;

class CredentialsResentMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $newPassword;
    public $settings;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $newPassword)
    {
        $this->user = $user;
        $this->newPassword = $newPassword;
        $this->settings = Setting::first(); // 👈 load current company info
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
            ->subject("🔁 Your {$companyName} Login Credentials Have Been Re-sent")
            ->view('emails.credentials_resent')
            ->with([
                'name'            => $this->user->name,
                'email'           => $this->user->email,
                'password'        => $this->newPassword,
                'loginUrl'        => url('/login'),
                'companyName'     => $companyName,
                'companyEmail'    => $companyEmail,
                'companyPhone'    => $this->settings->phone ?? '+233000000000',
                'companyAddress'  => $this->settings->address ?? 'Accra, Ghana',
            ]);
    }
}