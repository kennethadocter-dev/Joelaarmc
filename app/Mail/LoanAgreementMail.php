<?php

namespace App\Mail;

use App\Models\Loan;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class LoanAgreementMail extends Mailable
{
    use SerializesModels;

    public $loan;
    protected $pdfOutput;

    /**
     * Create a new message instance.
     */
    public function __construct(Loan $loan)
    {
        $this->loan = $loan;

        // ✅ Generate PDF directly from your real loan agreement design
        try {
            $pdf = Pdf::loadView('loan_agreement', [
                'loan' => $loan
            ])->setPaper('A4');

            $this->pdfOutput = $pdf->output();
        } catch (\Throwable $e) {
            Log::error('❌ Failed generating Loan Agreement PDF', [
                'loan_id' => $loan->id,
                'error' => $e->getMessage(),
            ]);
            $this->pdfOutput = null;
        }
    }

    /**
     * Build the message.
     */
    public function build()
    {
        // ✉️ Simple clean message body
        $email = $this->subject('Loan Agreement – ' . ($this->loan->client_name ?? 'Client'))
            ->view('loan_agreement_email') // keep your friendly email body
            ->with(['loan' => $this->loan]);

        // 📎 Attach the real rendered PDF
        if (!empty($this->pdfOutput)) {
            $email->attachData(
                $this->pdfOutput,
                "Loan_Agreement_#{$this->loan->id}.pdf",
                ['mime' => 'application/pdf']
            );
        }

        return $email;
    }
}