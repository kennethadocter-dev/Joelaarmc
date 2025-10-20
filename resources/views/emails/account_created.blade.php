<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your Joelaar Account Details</title>
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
        .content p {
            line-height: 1.6;
            margin: 10px 0;
        }
        .credentials {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .credentials p {
            margin: 5px 0;
            font-family: monospace;
            font-size: 15px;
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
            {{-- 👇 Make sure you have this logo in public/images/logo.png --}}
            <img src="{{ asset('images/logo.png') }}" alt="Joelaar Logo">
            <h1>Joelaar Micro-Credit</h1>
        </div>

        <div class="content">
            <h2>Hello {{ $user->name }},</h2>
            <p>Your Joelaar Micro-Credit account has been successfully created (or your credentials have been reset).</p>

            <p><strong>Login Details:</strong></p>
            <div class="credentials">
                <p><strong>Email:</strong> {{ $user->email }}</p>
                <p><strong>Password:</strong> {{ $plainPassword }}</p>
            </div>

            <p>You can log in using the button below:</p>
            <p style="text-align:center;">
                <a href="{{ $loginUrl }}" class="button">Login to Your Account</a>
            </p>

            <p style="margin-top: 25px; font-size: 14px;">
                <em>We recommend changing your password after your first login for security reasons.</em>
            </p>

            <p>Thank you,<br>
            <strong>The Joelaar Micro-Credit Team</strong></p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Joelaar Micro-Credit. All rights reserved.
        </div>
    </div>
</body>
</html>