@php
use Carbon\Carbon;

$today = Carbon::now();
$day = $today->format('jS');
$month = $today->format('F');
$year = $today->format('Y');
$location = 'BOLGATANGA';

$multipliers = [
    1 => 1.20,
    2 => 1.31,
    3 => 1.425,
    4 => 1.56,
    5 => 1.67,
    6 => 1.83,
];
$multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate / 100);
$total_due = round($loan->amount * $multiplier, 2);
$monthly_payment = round($total_due / $loan->term_months, 2);
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Loan Agreement – {{ $loan->client_name }}</title>
<style>
    body {
        font-family: "DejaVu Sans", sans-serif;
        color: #111;
        margin: 30px;
        line-height: 1.6;
        font-size: 13px;
    }
    h1, h2 {
        text-align: center;
        color: #222;
        margin-bottom: 10px;
    }
    .header {
        text-align: center;
        margin-bottom: 20px;
    }
    .logo {
        width: 80px;
        margin-bottom: 8px;
    }
    .subtext {
        font-size: 12px;
        color: #555;
    }
    .section {
        margin-top: 20px;
        page-break-inside: avoid;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 12px;
    }
    td, th {
        border: 1px solid #666;
        padding: 6px 8px;
    }
    th {
        background-color: #f3f3f3;
        font-weight: bold;
    }
    .footer {
        margin-top: 40px;
        font-size: 11px;
        text-align: center;
        color: #555;
        border-top: 1px solid #ccc;
        padding-top: 10px;
    }
    .signature {
        margin-top: 40px;
    }
    .signature p {
        margin-bottom: 8px;
    }
</style>
</head>

<body>
    <div class="header">
        <img src="{{ public_path('images/joelaar-logo.png') }}" alt="Joelaar Logo" class="logo">
        <h2>Joelaar Micro-Credit Services</h2>
        <div class="subtext">Empowering Growth Responsibly</div>
    </div>

    <p><strong>Date:</strong> {{ Carbon::now()->format('F d, Y') }}</p>
    <p><strong>Loan ID:</strong> #{{ $loan->id }}</p>

    <h1>LOAN AGREEMENT</h1>
    <p style="text-align:center;">
        <strong>Between Joelaar Micro-Credit Services (Lender) and {{ $loan->client_name }} (Borrower)</strong>
    </p>

    <div class="section">
        <h2>CLAUSE 1: PARTIES</h2>
        <p>
            THIS LOAN AGREEMENT is made at {{ $location }} this {{ $day }} day of {{ $month }} {{ $year }},
            between Joelaar Micro-Credit Services (hereinafter referred to as the “Lender”)
            and {{ $loan->client_name }} (hereinafter referred to as the “Borrower”).
        </p>
    </div>

    <div class="section">
        <h2>CLAUSE 2: SUBJECT MATTER AND DURATION</h2>
        <p>
            The subject matter is a loan facility of <strong>₵{{ number_format($loan->amount, 2) }}</strong>
            granted by the Lender to the Borrower for a period of
            <strong>{{ $loan->term_months }} month(s)</strong>,
            commencing on <strong>{{ Carbon::parse($loan->start_date)->format('F d, Y') }}</strong>.
        </p>
    </div>

    <div class="section">
        <h2>CLAUSE 3: AMOUNT, INTEREST AND TOTAL PAYABLE</h2>
        <p>
            The loan attracts an interest rate of <strong>{{ $loan->interest_rate }}%</strong>,
            bringing the total payable to <strong>₵{{ number_format($total_due, 2) }}</strong>.
            Each monthly installment shall be <strong>₵{{ number_format($monthly_payment, 2) }}</strong>
            for a duration of {{ $loan->term_months }} month(s).
        </p>
    </div>

    <div class="section">
        <h2>CLAUSE 4: TERMS OF PAYMENT</h2>
        <p>
            The Borrower shall make monthly payments commencing on
            {{ Carbon::parse($loan->start_date)->format('F d, Y') }}.
            The repayment schedule is as follows:
        </p>

        <table>
            <thead>
                <tr>
                    <th>Payment</th>
                    <th>Amount (₵)</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
                @for($i = 1; $i <= $loan->term_months; $i++)
                    @php $due = Carbon::parse($loan->start_date)->addMonths($i); @endphp
                    <tr>
                        <td>{{ $i }}{{ $i == 1 ? 'st' : ($i == 2 ? 'nd' : ($i == 3 ? 'rd' : 'th')) }} Payment</td>
                        <td>{{ number_format($monthly_payment, 2) }}</td>
                        <td>{{ $due->format('F d, Y') }}</td>
                    </tr>
                @endfor
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>CLAUSE 5: PENALTY</h2>
        <p>
            In the event of late payment, a penalty of <strong>0.5% per day</strong> of the overdue amount shall apply
            until full payment is made.
        </p>
    </div>

    <div class="section">
        <h2>CLAUSE 6: DEFAULT</h2>
        <p>
            Failure to comply with Clause 4 renders the Borrower in default and subject to legal recovery actions
            as deemed necessary by the Lender.
        </p>
    </div>

    <div class="section">
        <h2>CLAUSE 7: SECURITY</h2>
        <p>
            The Borrower hypothecates present and future stock as security for this loan, subject to recovery
            in the event of default.
        </p>
    </div>

    <div class="section">
        <h2>CLAUSE 8: GUARANTORS</h2>
        <p>
            The guarantors listed below (if any) shall be jointly and severally liable for the repayment
            of the Borrower’s loan obligations.
        </p>

        @if($loan->guarantors && count($loan->guarantors) > 0)
        <table style="margin-top:10px;">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Occupation</th>
                    <th>Residence</th>
                    <th>Contact</th>
                </tr>
            </thead>
            <tbody>
                @foreach($loan->guarantors as $g)
                <tr>
                    <td>{{ $g->name }}</td>
                    <td>{{ $g->occupation ?? 'N/A' }}</td>
                    <td>{{ $g->residence ?? 'N/A' }}</td>
                    <td>{{ $g->contact ?? '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
            <p><em>No guarantors recorded for this loan.</em></p>
        @endif
    </div>

    <div class="signature">
        <p><strong>Client:</strong> {{ $loan->client_name }}</p>
        <p>Signature & Date ____________________________</p>

        <p><strong>Manager:</strong> {{ $loan->user->name ?? 'Authorized Officer' }}</p>
        <p>Signature & Date ____________________________</p>
    </div>

    <div class="footer">
        <p>Bank Account Number: ____________________________</p>
        <p>Joelaar Micro-Credit Services | Bolgatanga, Ghana | Tel: +233 24 123 4567 | Email: info@joelaarcredit.com</p>
        <p><em>“This document is system-generated and valid without signature.”</em></p>
    </div>
</body>
</html>