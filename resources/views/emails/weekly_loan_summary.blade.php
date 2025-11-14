@component('mail::message')
# 📅 Weekly Loan Summary

**Period:** {{ $start }} – {{ $end }}

| Category | Count | Total Amount (₵) |
|:----------|:------:|----------------:|
| 🆕 New Loans Created | {{ $summary['created_count'] }} | {{ number_format($summary['created_total'], 2) }} |
| ✅ Loans Fully Paid | {{ $summary['completed_count'] }} | {{ number_format($summary['completed_total'], 2) }} |

---

### 💰 Totals Overview
- **Total Issued This Week:** ₵{{ number_format($summary['created_total'], 2) }}
- **Total Repaid This Week:** ₵{{ number_format($summary['completed_total'], 2) }}

---

@if(!empty($topLoans))
### 🏆 Top 5 Active Loans (Highest Balances)

| Client | Loan Code | Remaining (₵) | Due Date |
|:--------|:-----------|--------------:|:----------|
@foreach($topLoans as $loan)
| {{ $loan->client_name }} | {{ $loan->loan_code }} | {{ number_format($loan->amount_remaining, 2) }} | {{ \Carbon\Carbon::parse($loan->due_date)->format('M d, Y') }} |
@endforeach
@endif

---

Stay informed and keep leading responsibly.  
Thanks,  
**{{ config('app.name') }} System**
@endcomponent