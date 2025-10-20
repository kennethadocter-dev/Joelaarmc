<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Payment Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f8fa; margin: 0; padding: 0; color: #333;">
    <table role="presentation" style="max-width: 650px; margin: 30px auto; background: #fff; border-radius: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.05);">
        <tr>
            <td style="background-color: #1e40af; color: white; text-align: center; padding: 20px 10px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; font-size: 22px;">Payment Receipt</h2>
                <p style="margin: 5px 0 0;">{{ config('app.name') }}</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 25px 30px;">
                <p style="font-size: 15px; margin: 0 0 10px;">Dear <strong>{{ $loan->client_name }}</strong>,</p>

                <p style="font-size: 15px; margin: 0 0 15px;">
                    We’ve received your payment of 
                    <strong style="color: #1e40af;">₵{{ number_format($payment->amount, 2) }}</strong> 
                    for your loan <strong>#{{ $loan->id ?? '' }}</strong>.
                </p>

                <table style="width: 100%; border-collapse: collapse; background: #f9fafb; margin: 15px 0; border-radius: 8px;">
                    <tr>
                        <td style="padding: 8px 12px; font-weight: 600;">Payment Reference:</td>
                        <td style="padding: 8px 12px;">{{ $payment->reference ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 12px;">{{ $payment->paid_at->format('F j, Y, g:i a') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; font-weight: 600;">Method:</td>
                        <td style="padding: 8px 12px;">{{ ucfirst($payment->payment_method ?? 'Paystack') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; font-weight: 600;">Remaining Balance:</td>
                        <td style="padding: 8px 12px;">₵{{ number_format($loan->amount_remaining ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; font-weight: 600;">Status:</td>
                        <td style="padding: 8px 12px; text-transform: capitalize;">{{ $loan->status ?? 'active' }}</td>
                    </tr>
                </table>

                <p style="font-size: 15px; margin: 15px 0;">Thank you for your prompt payment!</p>
                <p style="font-size: 15px; margin: 0;">— <strong>{{ config('app.name') }}</strong> Team</p>
            </td>
        </tr>
        <tr>
            <td style="background: #f3f4f6; text-align: center; padding: 15px 10px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>