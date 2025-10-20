@php
use Carbon\Carbon;

$today = Carbon::now();
$day = $today->format('jS');
$month = $today->format('F');
$year = $today->format('Y');
$location = 'BOLGATANGA';

$agreement_line = "THIS LOAN AGREEMENT is made at {$location} this {$day} day of {$month} {$year} between Joelaar Micro-Credit Services (hereinafter referred to as the \"Lender\") and {$loan->client_name} (hereinafter referred to as the \"Borrower\").";

$multipliers = [1=>1.20, 2=>1.31, 3=>1.425, 4=>1.56, 5=>1.67, 6=>1.83];
$multiplier = $multipliers[$loan->term_months] ?? (1 + $loan->interest_rate/100);
$total_due = round($loan->amount * $multiplier, 2);
$monthly_payment = round($total_due / $loan->term_months, 2);
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Loan Agreement – {{ $loan->client_name }}</title>
<style>
  @page {
    margin: 25px 30px;
  }

  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #111;
    font-size: 13.5px;
    margin: 0;
    background: #fff;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1.5px solid #ccc;
    padding-bottom: 8px;
    margin-bottom: 20px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-section img {
    height: 48px;
    image-rendering: high-quality;
  }

  .header-text h2 {
    margin: 0;
    font-size: 17px;
    font-weight: bold;
    color: #111;
  }

  .header-text p {
    margin: 0;
    font-size: 12px;
    color: #555;
  }

  .right-header {
    text-align: right;
    font-size: 12.5px;
    color: #333;
  }

  h1 {
    text-align: center;
    text-transform: uppercase;
    font-size: 17px;
    margin-bottom: 5px;
  }

  h2 {
    color: #111;
    font-size: 14.5px;
    margin-top: 16px;
    margin-bottom: 6px;
  }

  p {
    margin-top: 0;
    margin-bottom: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 13px;
  }

  th, td {
    border: 1px solid #999;
    padding: 5px 8px;
  }

  th {
    background-color: #f3f3f3;
    text-align: left;
  }

  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 35px;
    font-size: 12.5px;
  }

  .signatures p {
    margin: 5px 0;
  }

  .footer {
    margin-top: 30px;
    font-size: 11.5px;
    border-top: 1px solid #ddd;
    padding-top: 8px;
    text-align: center;
    color: #666;
  }
</style>
</head>

<body>
  <div class="header">
    <div class="logo-section">
      <img src="{{ public_path('images/joelaar-logo.png') }}" alt="Joelaar Logo">
      <div class="header-text">
        <h2>JOELAAR MICRO-CREDIT SERVICES</h2>
        <p>Empowering Growth Responsibly</p>
      </div>
    </div>
    <div class="right-header">
      <p><strong>Date:</strong> {{ $today->format('F d, Y') }}</p>
      <p><strong>Loan ID:</strong> #{{ $loan->id }}</p>
    </div>
  </div>

  <h1>LOAN AGREEMENT</h1>
  <p style="text-align:center;">
    Between <strong>Joelaar Micro-Credit Services</strong> and <strong>{{ $loan->client_name }}</strong>
  </p>

  <h2>CLAUSE 1: PARTIES</h2>
  <p>{{ $agreement_line }}</p>

  <h2>CLAUSE 2: SUBJECT MATTER AND DURATION</h2>
  <p>The subject matter is a loan facility of <strong>₵{{ number_format($loan->amount, 2) }}</strong> provided by the Lender to the Borrower for a period of <strong>{{ $loan->term_months }}</strong> month(s) commencing on <strong>{{ Carbon::parse($loan->start_date)->format('F d, Y') }}</strong>.</p>

  <h2>CLAUSE 3: AMOUNT, INTEREST AND TOTAL PAYABLE</h2>
  <p>The loan attracts a stepped rate bringing the total payable to <strong>₵{{ number_format($total_due, 2) }}</strong>. Each monthly installment is <strong>₵{{ number_format($monthly_payment, 2) }}</strong> for {{ $loan->term_months }} months.</p>

  <h2>CLAUSE 4: TERMS OF PAYMENT</h2>
  <p>The Borrower shall make <strong>monthly</strong> payments commencing on <strong>{{ Carbon::parse($loan->start_date)->format('F d, Y') }}</strong>. The repayment schedule is as follows:</p>

  <table>
    <thead>
      <tr><th>Payment</th><th>Amount</th><th>Due Date</th></tr>
    </thead>
    <tbody>
      @for($i = 1; $i <= $loan->term_months; $i++)
      @php
        $dueDate = Carbon::parse($loan->start_date)->addMonths($i);
      @endphp
      <tr>
        <td>{{ $i }}{{ $i == 1 ? 'st' : ($i == 2 ? 'nd' : 'th') }} Payment</td>
        <td>₵{{ number_format($monthly_payment, 2) }}</td>
        <td>{{ $dueDate->format('F d, Y') }}</td>
      </tr>
      @endfor
    </tbody>
  </table>

  <h2>CLAUSE 5: PENALTY</h2>
  <p>If the Borrower fails to pay on time, a penalty of <strong>0.5% per day</strong> will apply.</p>

  <h2>CLAUSE 6: DEFAULT</h2>
  <p>Failure to comply with Clause 4 renders the Borrower in default.</p>

  <h2>CLAUSE 7: SECURITY</h2>
  <p>The Borrower hypothecates present and future stock as security for this loan.</p>

  <h2>CLAUSE 8: GUARANTORS</h2>
  <p>Guarantors are personally liable for all unpaid balances.</p>

  <div class="signatures">
    <div>
      <p><strong>Client:</strong> {{ $loan->client_name }}</p>
      <p>Signature & Date</p>
      <p><strong>Bank Account Number:</strong> ____________________________</p>
    </div>
    <div>
      <p><strong>Manager:</strong> {{ auth()->user()->name ?? 'Authorized Officer' }}</p>
      <p>Signature & Date</p>
    </div>
  </div>

  <div class="footer">
    Joelaar Micro-Credit Services | Bolgatanga, Ghana | Tel: +233 24 123 4567 | Email: info@joelaarcredit.com <br>
    <em>“This document is system-generated and valid without signature.”</em>
  </div>
</body>
</html>