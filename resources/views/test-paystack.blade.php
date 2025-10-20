<!DOCTYPE html>
<html>
<head>
  <title>Test Paystack</title>
</head>
<body>
  <h2>Test Paystack Payment</h2>
  <form method="POST" action="{{ route('paystack.initialize') }}">
    @csrf
    <input type="hidden" name="email" value="test@example.com">
    <input type="hidden" name="amount" value="10"> <!-- ₵10 -->
    <button type="submit">💳 Pay ₵10 Test Payment</button>
  </form>
</body>
</html>