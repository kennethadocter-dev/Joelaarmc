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
     * @var array<int, string>
     */
    protected $except = [
        // ✅ Payment-related routes
        'admin/payments/store',
        'admin/loans/*/record-payment',
        'admin/paystack/*',

        'superadmin/payments/store',
        'superadmin/loans/*/record-payment',
        'superadmin/paystack/*',

        // ✅ API endpoints that may post from external clients
        'api/*',

        // ✅ Optional health-check or system routes
        'system/*',
    ];
}