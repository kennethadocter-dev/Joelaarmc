<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Loan Created - {{ $companyName ?? 'Joelaar Micro-Credit' }}</title>
    <style>
        body {
            font-family: "Segoe UI", Arial, sans-serif;
            background-color: #f6f8fa;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        .header {
            background-color: #2563eb;
            color: #fff;
            padding: 25px;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
        }
        .header img {
            height: 60px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            color: #ffffff;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #2563eb;
            font-size: 22px;
            margin-bottom: 15px;
        }
        .content p {
            line-height: 1.6;
            margin: 10px 0;
        }
        .highlight-box {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #777;
            font-size: 13px;
            padding: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    @php
        $settings = \App\Models\Setting::first();
        $companyName = $settings?->company_name ?? 'Joelaar Micro-Credit';
        $companyPhone = $settings?->phone ?? '+233000000000';
        $companyEmail = $settings?->email ?? 'support@joelaar.com';
        $companyAddress = $settings?->address ?? 'Accra, Ghana';
    @endphp

    <div class="container">
        <div class="header">
            <img src="{{ asset('images/logo.png') }}" alt="{{ $companyName }} Logo">
            <h1>{{ $companyName }}</h1>
        </div>

        <div class="content">
            <h2>Hi {{ $loan->client_name }},</h2>
            <p>Your loan request has been successfully created and is currently pending approval.</p>

            <div class="highlight-box">
                <p><strong>Loan Amount:</strong> ₵{{ number_format($loan->amount, 2) }}</p>
                <p><strong>Term:</strong> {{ $loan->term_months }} months</p>
                <p><strong>Status:</strong> Pending Approval ⏳</p>
            </div>

            <p>Once approved, you will receive another notification and can log in anytime to view your loan details.</p>

            <p style="text-align:center; margin-top: 25px;">
                <a href="{{ url('/login') }}"
                   style="
                       display: inline-block;
                       padding: 12px 28px;
                       background-color: #2563eb;
                       color: #ffffff !important;
                       text-decoration: none;
                       border-radius: 8px;
                       font-weight: 600;
                       font-size: 16px;
                       transition: background-color 0.3s ease;
                   "
                   onmouseover="this.style.backgroundColor='#1e40af'"
                   onmouseout="this.style.backgroundColor='#2563eb'">
                   Login Now
                </a>
            </p>

            <p style="margin-top: 25px; font-size: 14px;">
                <em>We appreciate your trust in {{ $companyName }}. Please keep an eye on your phone or email for updates.</em>
            </p>

            <p>Best regards,<br>
            <strong>The {{ $companyName }} Team</strong></p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $companyName }}<br>
            📞 {{ $companyPhone }} | ✉️ {{ $companyEmail }}<br>
            📍 {{ $companyAddress }}
        </div>
    </div>
</body>
</html>