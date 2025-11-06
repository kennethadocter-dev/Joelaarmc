<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\ActivityLogger;

class ActivityController extends Controller
{
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

    /** 📋 Show logs */
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'superadmin', 'superuser'])) {
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

        return Inertia::render(ucfirst($this->basePath()) . '/ActivityLog/Index', [
            'logs'    => $logs,
            'filters' => ['q' => $search],
            'auth'    => ['user' => $user],
            'basePath'=> $this->basePath(),
        ]);
    }

    /** 🧹 Clear all logs */
    public function clear()
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'superadmin', 'superuser'])) {
            abort(403, 'Access denied.');
        }

        ActivityLog::truncate();
        ActivityLogger::log('Cleared Activity Logs', "Cleared by {$user->name}");
        return back()->with('success', '✅ Logs cleared.');
    }
}