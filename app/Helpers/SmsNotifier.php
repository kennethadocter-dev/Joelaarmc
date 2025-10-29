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
            // 🔑 Use your provided credentials
            $apiKey   = env('ARKESEL_SMS_API_KEY', 'c1RKRGttRUNCT2ZhTGtPZEZydmg');
            $senderId = env('ARKESEL_SMS_SENDER_ID', 'JOELAAR-MC');
            $url      = env('ARKESEL_SMS_URL', 'https://sms.arkesel.com/sms/api');

            if (empty($apiKey)) {
                Log::error('❌ Arkesel SMS Error: Missing API key in .env');
                self::queueSms($phone, $message, 'queued', 'missing_api_key');
                return false;
            }

            // 🧹 Normalize phone number (Ghana format)
            $phone = preg_replace('/\D/', '', $phone);
            if (str_starts_with($phone, '0')) {
                $phone = '233' . substr($phone, 1);
            } elseif (!str_starts_with($phone, '233')) {
                $phone = '233' . $phone;
            }

            // 📡 Build full GET URL
            $query = http_build_query([
                'action'   => 'send-sms',
                'api_key'  => $apiKey,
                'to'       => $phone,
                'from'     => $senderId,
                'sms'      => $message,
            ]);

            $fullUrl = "{$url}?{$query}";

            // 🚀 Send GET request
            $response = Http::timeout(10)->get($fullUrl);
            $statusCode = $response->status();
            $body = $response->body();

            // ✅ Success if status 200 and contains "OK" or "success"
            $success = $response->successful() && str_contains(strtolower($body), 'success');
            $status  = $success ? 'sent' : 'failed';

            self::logSms($phone, $message, $status, $success ? null : $body);

            if ($success) {
                Log::info('✅ SMS sent via Arkesel', [
                    'phone'    => $phone,
                    'message'  => $message,
                    'response' => $body,
                ]);
                return true;
            }

            Log::warning('⚠️ Arkesel SMS failed', [
                'phone'   => $phone,
                'message' => $message,
                'body'    => $body,
                'status'  => $statusCode,
            ]);
            self::queueSms($phone, $message, 'queued', $body);
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