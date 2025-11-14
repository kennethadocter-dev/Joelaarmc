<?php

namespace App\Jobs;

use App\Models\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;
use App\Mail\WeeklyLoanSummaryMail;

class SendWeeklyLoanSummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        try {
            $end = Carbon::now();
            $start = $end->copy()->subWeek();

            $createdLoans = Loan::whereBetween('created_at', [$start, $end])->get();
            $completedLoans = Loan::where('status', 'paid')
                ->whereBetween('updated_at', [$start, $end])->get();

            $summary = [
                'created_count' => $createdLoans->count(),
                'created_total' => $createdLoans->sum('amount'),
                'completed_count' => $completedLoans->count(),
                'completed_total' => $completedLoans->sum('amount'),
            ];

            // 🏆 Get top 5 active loans by remaining balance
            $topLoans = Loan::where('status', 'active')
                ->orderByDesc('amount_remaining')
                ->take(5)
                ->get(['client_name', 'loan_code', 'amount_remaining', 'due_date']);

            $mail = new WeeklyLoanSummaryMail(
                $summary,
                $start->format('M d'),
                $end->format('M d, Y'),
                $topLoans
            );

            $adminEmail = config('mail.from.address', 'admin@joelaar.local');
            Mail::to($adminEmail)->send($mail);

            Log::info('📨 Weekly Loan Summary sent', [
                'to' => $adminEmail,
                'summary' => $summary,
                'top_loans_count' => $topLoans->count(),
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send Weekly Loan Summary', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}