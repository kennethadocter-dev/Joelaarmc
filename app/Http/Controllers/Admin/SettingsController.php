<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Helpers\ActivityLogger;

class SettingsController extends Controller
{
    /** 🔧 Role-based helper (kept for routes and logging) */
    private function basePath(): string
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    public function __construct()
    {
        $this->middleware(['auth', 'can:access-admin']);
    }

    /** ⚙️ Settings Page (shared for Admin + Superadmin) */
    public function index()
    {
        try {
            $settings = Setting::firstOrCreate([]);

            return Inertia::render('Admin/Settings/Index', [
                'settings' => $settings,
                'auth'     => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
                'flash'    => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load settings.');
        }
    }

    /** 💾 Update Settings (shared) */
    public function update(Request $request)
    {
        try {
            /** 🛠 FIX — Allow POST or PUT */
            if ($request->isMethod('post')) {
                $request->merge(['_method' => 'put']);
            }

            $validated = $request->validate([
                'company_name'          => 'nullable|string|max:255',
                'address'               => 'nullable|string|max:255',
                'phone'                 => 'nullable|string|max:255',
                'email'                 => 'nullable|email|max:255',
                'bank_name'             => 'nullable|string|max:255',
                'bank_account_number'   => 'nullable|string|max:255',
                'manager_name'          => 'nullable|string|max:255',
                'manager_title'         => 'nullable|string|max:255',
                'default_interest_rate' => 'nullable|numeric|min:0',
                'default_term_months'   => 'nullable|integer|min:1',
                'default_penalty_rate'  => 'nullable|numeric|min:0',
                'grace_period_days'     => 'nullable|integer|min:0',
                'allow_early_repayment' => 'nullable|boolean',
            ]);

            $settings = Setting::firstOrCreate([]);
            $settings->fill(array_filter($validated))->save();

            ActivityLogger::log(
                'Updated Settings',
                'Settings updated by ' . Auth::user()->name
            );

            return back()->with('success', '✅ Settings updated successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update settings.');
        }
    }

    /** ♻️ Reset Settings to Default Values */
    public function reset()
    {
        try {
            $settings = Setting::firstOrCreate([]);

            $settings->fill([
                'company_name'          => 'Joelaar Micro-Credit Services',
                'address'               => 'Bolgatanga, Ghana',
                'email'                 => 'support@joelaar.com',
                'phone'                 => '+233000000000',
                'bank_name'             => 'Ghana Commercial Bank',
                'bank_account_number'   => '0000000000',
                'manager_name'          => 'Admin User',
                'manager_title'         => 'System Administrator',
                'default_interest_rate' => 20,
                'default_term_months'   => 3,
                'default_penalty_rate'  => 0.5,
                'grace_period_days'     => 0,
                'allow_early_repayment' => true,
            ])->save();

            ActivityLogger::log(
                'Reset Settings',
                'Settings reset by ' . Auth::user()->name
            );

            return back()->with('success', '🔁 Settings reset to default values.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to reset settings.');
        }
    }

    /** 🧰 Error Handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ SettingsController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.settings')
            ->with('error', $message);
    }
}