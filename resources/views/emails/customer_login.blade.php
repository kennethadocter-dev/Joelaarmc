<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Joelaar Login Details</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9fafb;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    h2 {
      color: #1d4ed8;
    }
    a.button {
      display: inline-block;
      background-color: #2563eb;
      color: #fff !important;
      padding: 10px 18px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    p.footer {
      font-size: 12px;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hello {{ $customer->full_name }},</h2>

    <p>🎉 Your account with <strong>Joelaar Micro-Credit</strong> has been created successfully!</p>

    <p>Here are your login credentials:</p>
    <p>
      <strong>Email:</strong> {{ $email }}<br>
      <strong>Password:</strong> {{ $password }}
    </p>

    <p>You can now log in to your portal:</p>
    <p><a href="{{ url('/login') }}" class="button">Go to Login</a></p>

    <p class="footer">
      Keep this information safe.<br>
      Thank you for joining Joelaar Micro-Credit.<br>
      — The Joelaar Team
    </p>
  </div>
</body>
</html>