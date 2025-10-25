<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Loan Completed — {{ $companyName }}</title>
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
        }
        .header img {
            height: 60px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #2563eb;
            font-size: 22px;
            margin-bottom: 15px;
        }
        .credentials {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
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
    <div class="container">
        <div class="header">
            <img src="{{ asset('images/logo.png') }}" alt="{{ $companyName }} Logo">
            <h1>{{ $companyName }}</h1>
        </div>

        <div class="content">
            <h2>🎉 Congratulations {{ $client_name }}!</h2>
            <p>We’re thrilled to inform you that your loan of <strong>₵{{ $amount }}</strong> with <strong>{{ $companyName }}</strong> has been successfully completed and fully paid off.</p>

            <p>This achievement reflects your commitment and trust in our services — we truly appreciate you!</p>

            <div class="credentials">
                <p><strong>Loan ID:</strong> {{ $loan->id }}</p>
                <p><strong>Status:</strong> Completed</p>
                <p><strong>Completion Date:</strong> {{ $loan->updated_at->format('d M Y, h:i A') }}</p>
            </div>

            <p>Thank you for choosing <strong>{{ $companyName }}</strong>. We look forward to supporting your next financial goal.</p>

            <p style="text-align:center;">
                <a href="{{ $loginUrl }}" class="button">View Your Account</a>
            </p>

            <p style="margin-top: 25px; font-size: 14px;">
                <em>Your financial journey continues — we’re always here for you!</em>
            </p>

            <p>Warm regards,<br>
            <strong>The {{ $companyName }} Team</strong></p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $companyName }}. All rights reserved.</p>
            <p>{{ $companyAddress }} | 📞 {{ $companyPhone }} | ✉️ {{ $companyEmail }}</p>
        </div>
    </div>
</body>
</html>