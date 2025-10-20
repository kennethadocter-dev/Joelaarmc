<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Custom unified rendering for all errors
     */
    public function render($request, Throwable $e)
    {
        // ✅ Always log for debugging
        Log::error('💥 Global Exception Caught', [
            'url'   => $request->fullUrl(),
            'user'  => Auth::user()?->email,
            'role'  => Auth::user()?->role ?? 'guest',
            'error' => $e->getMessage(),
        ]);

        $user = Auth::user();

        // ✅ Let superadmin see full Laravel debug screen
        if ($user && strtolower($user->role ?? '') === 'superadmin') {
            return parent::render($request, $e);
        }

        // ✅ Handle 404 Page
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            return inertia('Errors/404')->toResponse($request)->setStatusCode(404);
        }

        // ✅ Handle 500 Page
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException && $e->getStatusCode() === 500) {
            return inertia('Errors/500')->toResponse($request)->setStatusCode(500);
        }

        // ✅ If Inertia request (SPA), show toast not error page
        if ($request->header('X-Inertia')) {
            return back()->with('error', '⚠️ Something went wrong. Please try again later.');
        }

        // ✅ Graceful redirect for normal web requests
        return redirect()
            ->route(Auth::check() ? 'dashboard' : 'login')
            ->with('error', '⚠️ Something went wrong. Please try again later.');
    }
}