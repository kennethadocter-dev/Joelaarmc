<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WeeklyLoanSummaryMail extends Mailable
{
    use Queueable, SerializesModels;

    public $summary;
    public $startDate;
    public $endDate;
    public $topLoans;

    /**
     * Create a new message instance.
     */
    public function __construct(array $summary, string $startDate, string $endDate, $topLoans = [])
    {
        $this->summary = $summary;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->topLoans = $topLoans;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("📊 Weekly Loan Summary ({$this->startDate} - {$this->endDate})")
            ->markdown('emails.weekly_loan_summary')
            ->with([
                'summary' => $this->summary,
                'start' => $this->startDate,
                'end' => $this->endDate,
                'topLoans' => $this->topLoans,
            ]);
    }
}