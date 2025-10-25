<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your {{ $companyName }} Login Details</title>
    <style>
        body {font-family: 'Helvetica Neue', Arial, sans-serif;background: #f9f9f9;color: #333;line-height: 1.6;padding: 30px;}
        .container {max-width: 600px;margin: auto;background: white;border-radius: 12px;box-shadow: 0 2px 8px rgba(0,0,0,0.1);}
        .header {background: #f0f5ff;padding: 20px;text-align: center;}
        .header img {max-height: 60px;}
        .content {padding: 30px;}
        .panel {background: #f9f9f9;border-radius: 8px;padding: 15px;margin-top: 10px;}
        .button {display: inline-block;padding: 12px 22px;background: #0c6cf2;color: white;text-decoration: none;border-radius: 6px;margin-top: 15px;}
        .footer {background: #fafafa;padding: 15px;text-align: center;font-size: 13px;color: #777;}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="{{ $companyLogo }}" alt="{{ $companyName }} logo">
    </div>
    <div class="content">
        <h2>🔐 Your {{ $companyName }} Account is Ready!</h2>
        <p>Hello {{ $customer->full_name }}, here are your login credentials:</p>

        <div class="panel">
            <p><strong>🌐 Login URL:</strong> <a href="{{ url('/login') }}">{{ url('/login') }}</a></p>
            <p><strong>📧 Email:</strong> {{ $email }}</p>
            <p><strong>🔑 Password:</strong> {{ $password }}</p>
        </div>

        <p>Please keep these details safe and do not share them with anyone.</p>

        <a href="{{ url('/login') }}" class="button">Login Now</a>
    </div>
    <div class="footer">
        <p>{{ $companyName }}<br>
        📞 {{ $companyPhone }} | 🌐 <a href="{{ $companyUrl }}">{{ $companyUrl }}</a></p>
    </div>
</div>
</body>
</html>