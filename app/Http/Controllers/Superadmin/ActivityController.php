<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\ActivityLogger;

class ActivityController extends Controller
{
    /**
     * Determine base Inertia path depending on user
     */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    public function __construct()
    {
        $this->middleware(['auth']);
    }

    /**
     * 📋 Show activity logs
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Internal protection
        if (
            !$user->is_super_admin &&
            !in_array($user->role, ['superadmin', 'admin', 'superuser'])
        ) {
            abort(403, 'Access denied.');
        }

        $search = $request->query('q');

        $logs = ActivityLog::with('user:id,name,email')
            ->when($search, function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render(
            ucfirst($this->basePath()) . '/Activity/Index', // ✅ FIXED PATH
            [
                'logs'     => $logs,
                'filters'  => ['q' => $search],
                'auth'     => ['user' => $user],
                'basePath' => $this->basePath(), // used by JS for dynamic routes
            ]
        );
    }

    /**
     * 🧹 Clear all logs
     */
    public function clear()
    {
        $user = auth()->user();

        // Internal security
        if (
            !$user->is_super_admin &&
            !in_array($user->role, ['superadmin', 'admin', 'superuser'])
        ) {
            abort(403, 'Access denied.');
        }

        ActivityLog::truncate();

        ActivityLogger::log(
            'Cleared Activity Logs',
            "Cleared by {$user->name}"
        );

        return back()->with('success', 'Logs cleared.');
    }
}