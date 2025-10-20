<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default with all Inertia responses.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        /**
         * 🧩 Detect the correct base path before rendering
         * This ensures the frontend immediately knows if it’s under
         * /admin or /superadmin — no more flickering or URL switching.
         */
        $basePath = 'admin';
        if ($user && ($user->is_super_admin || $user->role === 'superadmin')) {
            $basePath = 'superadmin';
        }

        // ⚠️ Do NOT call url()->defaults() — that causes hydration mismatch
        // We only pass basePath to Inertia for role-aware routing.

        return array_merge(parent::share($request), [
            // 🔐 Authentication info + permissions
            'auth' => [
                'user' => $user,
                'can' => [
                    'superadmin' => $user?->can('access-superadmin') ?? false,
                    'admin'      => $user?->can('access-admin') ?? false,
                    'user'       => $user?->can('access-user') ?? false,
                ],
            ],

            // 🌐 Role-based base path for frontend
            'basePath' => $basePath,
        ]);
    }
}