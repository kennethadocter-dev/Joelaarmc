<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Indicates whether the XSRF-TOKEN cookie should be set on the response.
     *
     * @var bool
     */
    protected $addHttpCookie = true;

    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * You can add API routes or webhook endpoints here if needed.
     *
     * @var array<int, string>
     */
    protected $except = [
        // ✅ Allow CSRF check endpoint for debugging only
        '/csrf-check',

        // ✅ Allow Paystack webhooks or callbacks if used
        'admin/paystack/*',
        'superadmin/paystack/*',

        // (Optional) If you ever expose APIs, add them here
        // 'api/*',
    ];
}