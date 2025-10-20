<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\App;
use Carbon\Carbon;

class SmsNotifier
{
    /**
     * 📲 Send an SMS using Arkesel API and log it in sms_logs table.
     * If sending fails, message is stored as "queued" for retry.
     *
     * @param string $phone   Recipient phone (233xxxxxxxxx or local format)
     * @param string $message Text to send
     * @return bool
     */
    public static function send(string $phone, string $message): bool
    {
        try {
            // ✅ Support both key styles
            $apiKey   = env('ARKESEL_SMS_API_KEY', env('ARKESEL_API_KEY'));
            $senderId = env('ARKESEL_SMS_SENDER_ID', env('ARKESEL_SENDER_ID', 'Joelaar'));
            $url      = env('ARKESEL_SMS_URL', 'https://sms.arkesel.com/api/v2/sms/send');

            // 🧠 Validate credentials before sending
            if (empty($apiKey)) {
                Log::error('❌ Arkesel SMS Error: Missing API key in .env');
                self::queueSms($phone, $message, 'queued', 'missing_api_key');
                return false;
            }

            // 🧹 Normalize phone number (Ghana format default)
            $phone = preg_replace('/\D/', '', $phone);
            if (str_starts_with($phone, '0')) {
                $phone = '233' . substr($phone, 1);
            } elseif (!str_starts_with($phone, '233')) {
                $phone = '233' . $phone;
            }

            // ✉️ Prepare payload
            $payload = [
                'sender'     => $senderId,
                'message'    => $message,
                'recipients' => [$phone],
            ];

            // 🚀 Send SMS via Arkesel (with timeout + JSON)
            $response = Http::timeout(10)
                ->withHeaders([
                    'api-key' => $apiKey,
                    'Accept'  => 'application/json',
                ])
                ->post($url, $payload);

            $statusCode = $response->status();
            $success = $response->successful();
            $body = $response->json();

            // ✅ Determine result
            $status = $success ? 'sent' : 'failed';
            $error  = $success ? null : json_encode($body, JSON_PRETTY_PRINT);

            // 🧾 Save to database (sms_logs table)
            self::logSms($phone, $message, $status, $error);

            // 🗂 Log to Laravel log
            if ($success) {
                Log::info('✅ SMS sent via Arkesel', [
                    'phone'    => $phone,
                    'message'  => $message,
                    'response' => $body,
                    'status'   => $statusCode,
                ]);
                return true;
            }

            // ⚠️ If API failed, queue it for retry
            Log::warning('⚠️ Arkesel SMS failed, queued for retry', [
                'phone'   => $phone,
                'message' => $message,
                'status'  => $statusCode,
                'body'    => $body,
            ]);
            self::queueSms($phone, $message, 'queued', $error);

            return false;
        } catch (\Exception $e) {
            Log::error('❌ SMS sending error', ['error' => $e->getMessage()]);
            self::queueSms($phone ?? 'unknown', $message, 'queued', $e->getMessage());
            return false;
        }
    }

    /**
     * 🧾 Save SMS attempt to database
     */
    private static function logSms(string $phone, string $message, string $status, ?string $error = null): void
    {
        try {
            DB::table('sms_logs')->insert([
                'phone'      => $phone,
                'message'    => $message,
                'status'     => $status,
                'error'      => $error,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to record SMS in database', ['error' => $e->getMessage()]);
        }
    }

    /**
     * 🕓 Queue SMS for retry when sending fails or API is down.
     */
    private static function queueSms(string $phone, string $message, string $status = 'queued', ?string $error = null): void
    {
        try {
            DB::table('sms_logs')->insert([
                'phone'      => $phone,
                'message'    => $message,
                'status'     => $status,
                'error'      => $error,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('📦 SMS queued for retry', [
                'phone'   => $phone,
                'message' => $message,
                'status'  => $status,
                'error'   => $error,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Could not log queued SMS', ['error' => $e->getMessage()]);
        }
    }

    /**
     * ⏰ Automatically schedule retry every 30 minutes using Laravel scheduler.
     * This will trigger `php artisan sms:retry` silently.
     */
    public static function scheduleAutoRetry(): void
    {
        try {
            // Only run inside console (not web requests)
            if (App::runningInConsole()) {
                return;
            }

            $lastRunFile = storage_path('logs/sms_retry_last_run.txt');

            if (file_exists($lastRunFile)) {
                $lastRun = Carbon::parse(trim(file_get_contents($lastRunFile)));
                if ($lastRun->diffInMinutes(now()) < 30) {
                    return; // ⏳ Not yet 30 minutes since last run
                }
            }

            // 🕒 Run retry command silently
            Artisan::call('sms:retry');
            file_put_contents($lastRunFile, now()->toDateTimeString());
            Log::info('🕓 Auto SMS retry executed via SmsNotifier.');
        } catch (\Throwable $e) {
            Log::error('❌ Auto SMS retry failed', ['error' => $e->getMessage()]);
        }
    }
}