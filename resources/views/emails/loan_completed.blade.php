<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Loan Completed – {{ $companyName }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 30px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #f0f5ff;
            padding: 25px;
            text-align: center;
        }
        .header img {
            max-height: 60px;
        }
        .content {
            padding: 30px;
        }
        h2 {
            color: #0c6cf2;
            margin-bottom: 15px;
        }
        .highlight {
            background: #f9f9f9;
            border-left: 4px solid #0c6cf2;
            padding: 15px;
            border-radius: 8px;
        }
        .button {
            display: inline-block;
            background: #0c6cf2;
            color: white;
            padding: 12px 22px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 15px;
        }
        .footer {
            background: #fafafa;
            padding: 15px;
            text-align: center;
            font-size: 13px;
            color: #777;
        }
        a { color: #0c6cf2; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="{{ $companyLogo }}" alt="{{ $companyName }} Logo">
    </div>
    <div class="content">
        <h2>🎉 Congratulations, {{ $client_name }}!</h2>
        <p>We’re excited to inform you that your loan with <strong>{{ $companyName }}</strong> has been fully paid off. You’ve officially completed your repayment — that’s an incredible achievement! 🙌</p>

        <div class="highlight">
            <p><strong>Loan ID:</strong> #{{ $loan->id }}</p>
            <p><strong>Amount Paid:</strong> ₵{{ $amount }}</p>
            <p><strong>Status:</strong> Fully Paid ✅</p>
        </div>

        <p>Thank you for your consistency and trust in {{ $companyName }}. We look forward to serving you again in the future.</p>

        <p style="text-align:center;">
            <a href="{{ $loginUrl }}" class="button">View My Account</a>
        </p>

        <p style="margin-top:20px;">Warm regards,<br>
        <strong>{{ $companyName }} Team</strong></p>
    </div>

    <div class="footer">
        <p>{{ $companyName }} | {{ $companyAddress }}<br>
        📞 {{ $companyPhone }} | 🌐 <a href="{{ $companyUrl }}">{{ $companyUrl }}</a></p>
    </div>
</div>
</body>
</html>