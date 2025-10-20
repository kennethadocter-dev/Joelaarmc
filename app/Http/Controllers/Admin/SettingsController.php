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
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /**
     * 🧭 Restrict access to Admins
     */
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-admin']);
    }

    /**
     * ⚙️ Display the Settings page
     */
    public function index()
    {
        try {
            // Ensure one settings record always exists
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
            return $this->handleError($e, '⚠️ Failed to load settings page.');
        }
    }

    /**
     * 💾 Update Settings
     */
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'company_name'          => 'nullable|string|max:255',
                'address'               => 'nullable|string|max:2000',
                'phone'                 => 'nullable|string|max:255',
                'email'                 => 'nullable|email|max:255',
                'bank_name'             => 'nullable|string|max:255',
                'bank_account_number'   => 'nullable|string|max:255',
                'manager_name'          => 'nullable|string|max:255',
                'manager_title'         => 'nullable|string|max:255',
                'default_interest_rate' => 'required|numeric|min:0',
                'default_term_months'   => 'required|integer|min:1|max:36',
                'default_penalty_rate'  => 'required|numeric|min:0',
                'grace_period_days'     => 'required|integer|min:0|max:60',
                'allow_early_repayment' => 'required|boolean',
            ]);

            $settings = Setting::firstOrCreate([]);
            $settings->fill($validated)->save();

            ActivityLogger::log('Updated Settings', 'Settings updated by ' . Auth::user()->name);

            return back()->with('success', '✅ Settings updated successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update settings.');
        }
    }

    /**
     * ♻️ Reset all settings to default
     */
    public function reset()
    {
        try {
            $defaults = [
                'company_name'          => 'Joelaar Micro-Credit Services',
                'address'               => 'Accra, Ghana',
                'phone'                 => '+233000000000',
                'email'                 => 'support@joelaar.com',
                'bank_name'             => 'GCB Bank',
                'bank_account_number'   => '000123456789',
                'manager_name'          => 'Super Admin',
                'manager_title'         => 'Manager',
                'default_interest_rate' => 20,
                'default_term_months'   => 3,
                'default_penalty_rate'  => 0.5,
                'grace_period_days'     => 0,
                'allow_early_repayment' => true,
            ];

            $settings = Setting::firstOrCreate([]);
            $settings->fill($defaults)->save();

            ActivityLogger::log('Reset Settings', 'Settings reset by ' . Auth::user()->name);

            return back()->with('success', '🔁 Settings reset to default values.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to reset settings.');
        }
    }

    /**
     * 🧰 Unified Safe Error Handler
     */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        if ($user && strtolower($user->role ?? '') === 'superadmin') {
            throw $e; // Let superadmin see full error
        }

        Log::error('❌ SettingsController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.settings.index')
            ->with('error', $message);
    }
}