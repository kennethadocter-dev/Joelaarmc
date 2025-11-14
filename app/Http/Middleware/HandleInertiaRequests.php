<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared props for every Inertia page
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $role = $user->role ?? null;

        /**
         * -----------------------------------
         * 🔍 BASE PATH DETECTION
         * -----------------------------------
         */
        switch ($role) {
            case 'superadmin':
                $basePath = 'superadmin';
                break;

            case 'admin':
            case 'staff':
                $basePath = 'admin';
                break;

            case 'customer':
                $basePath = 'user';
                break;

            default:
                $basePath = '';
        }

        return array_merge(parent::share($request), [

            /**
             * -----------------------------------
             * 🔐 AUTH USER SHARED TO FRONTEND
             * -----------------------------------
             */
            'auth' => [
                'user' => $user ? [
                    'id'    => $user->id,
                    'name'  => $user->name ?? $user->full_name,
                    'email' => $user->email ?? null,
                    'role'  => $role,

                    // 🔥 CRITICAL FIX — your frontend depends on this
                    'is_super_admin' => ($role === 'superadmin'),
                ] : null,
            ],

            /**
             * -----------------------------------
             * 🔁 BASE PATH FOR ROUTING
             * -----------------------------------
             */
            'basePath' => $basePath,

            /**
             * -----------------------------------
             * 🔔 FLASH MESSAGES
             * -----------------------------------
             */
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }
}