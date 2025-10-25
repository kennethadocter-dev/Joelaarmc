<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to {{ $companyName }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background: #f9f9f9;
            color: #333;
            line-height: 1.6;
            padding: 30px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #f0f5ff;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-height: 60px;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 22px;
            background: #0c6cf2;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 15px;
        }
        .footer {
            background: #fafafa;
            padding: 15px;
            text-align: center;
            font-size: 13px;
            color: #777;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="{{ $companyLogo }}" alt="{{ $companyName }} logo">
    </div>
    <div class="content">
        <h2>👋 Welcome, {{ $customer->full_name }}!</h2>
        <p>
            We’re thrilled to have you join the <strong>{{ $companyName }}</strong> family.
        </p>
        <p>
            You can now access your loan information, payment schedules, and updates right from your account.
        </p>

        <a href="{{ url('/login') }}" class="button">Login to your account</a>

        <p style="margin-top: 20px;">Need help? Just reply to this email or reach us via the contact below.</p>
    </div>
    <div class="footer">
        <p>{{ $companyName }}<br>
        📞 {{ $companyPhone }} | 🌐 <a href="{{ $companyUrl }}">{{ $companyUrl }}</a></p>
    </div>
</div>
</body>
</html>