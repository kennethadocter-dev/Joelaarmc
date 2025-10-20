<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\ActivityLogger;

class ActivityController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth']);
    }

    /**
     * 📋 Show all activity logs (admin + superadmin)
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'superadmin', 'superuser'])) {
            abort(403, 'Access denied. Only administrators can view activity logs.');
        }

        $search = $request->query('q');

        // ✅ Load logs with related user info (name + email)
        $logs = ActivityLog::with('user:id,name,email')
            ->when($search, function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('ActivityLog/Index', [
            'logs'    => $logs,
            'filters' => ['q' => $search],
            'auth'    => ['user' => $user],
        ]);
    }

    /**
     * 🧹 Clear all logs (admin + superadmin)
     */
    public function clear()
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'superadmin', 'superuser'])) {
            abort(403, 'Access denied. Only administrators can clear logs.');
        }

        ActivityLog::truncate();

        ActivityLogger::log('Cleared Activity Logs', "All activity logs cleared by {$user->name}");

        return back()->with('success', '✅ All activity logs cleared successfully.');
    }
}