<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Helpers\SmsNotifier;
use App\Helpers\ActivityLogger;

class ManageCustomersController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!auth()->user() || auth()->user()->role !== 'superadmin') {
                abort(403, 'Access denied.');
            }
            return $next($request);
        });
    }

    /**
     * 📋 List customers (active, inactive, suspended)
     */
    public function index(Request $request)
    {
        try {
            $q = trim($request->query('q', ''));
            $status = $request->query('status', 'all');

            $query = Customer::orderByDesc('created_at'); // No soft deletes

            if ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('full_name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%");
                });
            }

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $customers = $query->get();

            $counts = [
                'active'    => Customer::where('status', 'active')->count(),
                'inactive'  => Customer::where('status', 'inactive')->count(),
                'suspended' => Customer::where('status', 'suspended')->count(),
                'total'     => Customer::count(),
            ];

            ActivityLogger::log('Viewed Manage Customers', 'Superadmin viewed manage customers.');

            return Inertia::render('Superadmin/ManageCustomers/Index', [
                'customers' => $customers,
                'counts'    => $counts,
                'filters'   => [
                    'q'      => $q,
                    'status' => $status,
                ],
            ]);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * ✏️ Edit customer login
     */
    public function edit($id)
    {
        try {
            $customer = Customer::findOrFail($id);

            return Inertia::render('Superadmin/ManageCustomers/Edit', [
                'customer' => $customer,
            ]);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * 💾 Update login info
     */
    public function update(Request $request, $id)
    {
        try {
            $customer = Customer::findOrFail($id);

            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'email'     => 'nullable|email|unique:customers,email,' . $customer->id,
                'phone'     => ['nullable', 'regex:/^(0|233)\d{9}$/'],
                'status'    => 'required|in:active,inactive,suspended',
                'password'  => 'nullable|string|min:6',
            ]);

            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            $customer->update($validated);

            ActivityLogger::log('Updated Customer Login', "Updated {$customer->full_name}");

            return redirect()->route('superadmin.manage-customers.index')
                ->with('success', "Updated {$customer->full_name}'s account.");
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * 📤 Resend credentials (SMS only)
     */
    public function resendCredentials($id)
    {
        try {
            $customer = Customer::findOrFail($id);

            $newPassword = Str::random(8);
            $customer->update(['password' => bcrypt($newPassword)]);

            ActivityLogger::log('Resent Customer Credentials', "Resent to {$customer->full_name}");

            // 🔥 SMS only (email disabled)
            $this->notifyCustomer($customer, $newPassword);

            return back()->with('success', "📨 Credentials resent via SMS.");
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * ❌ Permanent delete
     */
    public function destroy($id)
    {
        try {
            $customer = Customer::findOrFail($id);

            $name = $customer->full_name;
            $customer->delete(); // permanent

            ActivityLogger::log('Deleted Customer', "Deleted {$name}");

            return back()->with('success', "🗑️ {$name} deleted.");
        } catch (\Throwable $e) {
            throw $e;
        }
    }


    /* =========================================================================
       📩 NOTIFICATION SYSTEM (SMS ONLY FOR NOW, EMAIL DISABLED)
    ========================================================================= */

    private function notifyCustomer(Customer $customer, string $password)
    {
        try {
            // Build SMS text
            $message = $this->buildSmsMessage($customer, $password);

            // Send SMS ONLY
            if (!empty($customer->phone)) {
                SmsNotifier::send($customer->phone, $message);
            }

        } catch (\Throwable $e) {
            Log::warning("SMS Notifier Error: " . $e->getMessage());
        }
    }

    /**
     * 🧾 Create one centralized SMS format
     */
    private function buildSmsMessage(Customer $customer, string $password)
    {
        $company = config('app.name', 'Joelaar');
        $loginUrl = url('/login');

        return "Hello {$customer->full_name}, your {$company} login was updated.\n"
            ."Email: {$customer->email}\n"
            ."Password: {$password}\n"
            ."Login: {$loginUrl}\n"
            ."Keep your credentials safe.";
    }
}