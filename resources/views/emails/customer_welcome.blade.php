<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Joelaar Micro-Credit</title>
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

    <p>🎉 Welcome to <strong>Joelaar Micro-Credit</strong>!</p>

    <p>We’re excited to let you know that your customer profile has been created successfully in our system.</p>

    <p>Our team will contact you soon regarding your loan request or any next steps.</p>

    <p>You can always reach out to us if you have any questions — we’re happy to assist!</p>

    <p style="margin-top: 24px;">
      <a href="{{ url('/login') }}" class="button">Visit Our Portal</a>
    </p>

    <p class="footer">
      Thank you for choosing Joelaar Micro-Credit.<br>
      <strong>— The Joelaar Team</strong>
    </p>
  </div>
</body>
</html>