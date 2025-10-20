<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Loan Agreement – Joelaar Micro-Credit Services</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #222;
            background: #f9f9f9;
            padding: 30px;
        }
        .container {
            background: #fff;
            border-radius: 8px;
            padding: 25px 35px;
            max-width: 650px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .header img {
            height: 50px;
        }
        .header-text {
            line-height: 1.2;
        }
        .header-text h2 {
            margin: 0;
            color: #111;
            font-size: 20px;
            font-weight: bold;
        }
        .header-text p {
            margin: 0;
            font-size: 13px;
            color: #666;
        }
        h1 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
        }
        p {
            line-height: 1.6;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .summary {
            background: #f3f3f3;
            border-radius: 6px;
            padding: 12px 15px;
            margin: 15px 0;
            font-size: 14px;
        }
        .summary p {
            margin: 4px 0;
        }
        .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 12px;
            text-align: left;
        }
        .disclaimer {
            margin-top: 15px;
            font-size: 11px;
            color: #888;
            font-style: italic;
        }
    </style>
</head>
<body>
<div class="container">
    <!-- 🏦 Header -->
    <div class="header">
        <img src="{{ asset('images/joelaar-logo.png') }}" alt="Joelaar Logo">
        <div class="header-text">
            <h2>Joelaar Micro-Credit Services</h2>
            <p>Empowering Growth Responsibly</p>
        </div>
    </div>

    <h1>Loan Agreement</h1>

    <p>Dear {{ $loan->client_name }},</p>

    <p>Attached to this email is your official <strong>Loan Agreement</strong> from
    <strong>Joelaar Micro-Credit Services</strong>.</p>

    <div class="summary">
        <p><strong>Loan ID:</strong> #{{ $loan->id }}</p>
        <p><strong>Loan Amount:</strong> ₵{{ number_format($loan->amount, 2) }}</p>
        <p><strong>Term:</strong> {{ $loan->term_months }} month(s)</p>
        <p><strong>Interest Rate:</strong> {{ $loan->interest_rate }}%</p>
        <p><strong>Due Date:</strong> {{ \Carbon\Carbon::parse($loan->due_date)->format('jS F Y') }}</p>
    </div>

    <p>Please review the attached document carefully and keep it for your records.</p>

    <p>Thank you for choosing Joelaar Micro-Credit Services.<br>
    If you have any questions, reply to this email or visit our office.</p>

    <div class="footer">
        <strong>Joelaar Micro-Credit Services</strong><br>
        Bolgatanga, Ghana<br>
        Tel: +233 24 123 4567<br>
        Email: info@joelaarcredit.com
        <div class="disclaimer">
            “This document is system-generated and valid without signature.”
        </div>
    </div>
</div>
</body>
</html>