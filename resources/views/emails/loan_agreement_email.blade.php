<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loan Agreement</title>
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
            padding: 25px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            font-size: 20px;
        }
        p {
            line-height: 1.5;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>Loan Agreement</h1>

    <p>Dear {{ $loan->client_name }},</p>

    <p>Attached to this email is your official <strong>Loan Agreement</strong> from
    <strong>Joelaar Micro-Credit Services</strong>.</p>

    <p>Please review it carefully and keep it for your records.</p>

    <p>Thank you for choosing Joelaar Micro-Credit Services.<br>
    If you have any questions, reply to this email or visit our office.</p>

    <div class="footer">
        Joelaar Micro-Credit Services<br>
        Bolgatanga, Ghana<br>
        Tel: +233 24 123 4567 | Email: info@joelaarcredit.com
    </div>
</div>
</body>
</html>