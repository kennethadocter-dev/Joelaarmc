<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Mail\CustomerLoginMail;
use App\Mail\CustomerWelcomeMail;
use App\Helpers\SmsNotifier;
use App\Helpers\ActivityLogger;

class ManageCustomersController extends Controller
{
    public function __construct()
    {
        // ✅ Restrict access to Superadmin only
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user || $user->role !== 'superadmin') {
                abort(403, 'Access denied. Only Superadmins can manage customer accounts.');
            }
            return $next($request);
        });
    }

    /** 📋 List all customers (active, deleted, suspended) */
    public function index(Request $request)
    {
        try {
            $q = trim($request->query('q', ''));
            $status = $request->query('status', 'all');

            $query = Customer::withTrashed()->orderByDesc('created_at');

            if ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('full_name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%");
                });
            }

            if ($status !== 'all') {
                if ($status === 'deleted') {
                    $query->onlyTrashed();
                } else {
                    $query->where('status', $status);
                }
            }

            $customers = $query->get();

            $counts = [
                'active'    => Customer::where('status', 'active')->count(),
                'inactive'  => Customer::where('status', 'inactive')->count(),
                'suspended' => Customer::where('status', 'suspended')->count(),
                'deleted'   => Customer::onlyTrashed()->count(),
                'total'     => Customer::withTrashed()->count(),
            ];

            ActivityLogger::log('Viewed Manage Customers', 'Superadmin viewed manage customers list.');

            return Inertia::render('Superadmin/ManageCustomers/Index', [
                'customers' => $customers,
                'counts'    => $counts,
                'filters'   => [
                    'q'      => $q,
                    'status' => $status,
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load customer management page.');
        }
    }

    /** ✏️ Edit customer login credentials */
    public function edit(Customer $customer)
    {
        try {
            ActivityLogger::log('Editing Customer Login', "Superadmin opened edit form for {$customer->full_name}");

            return Inertia::render('Superadmin/ManageCustomers/Edit', [
                'customer' => $customer,
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load customer edit form.');
        }
    }

    /** 💾 Update customer info or password */
    public function update(Request $request, Customer $customer)
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'email'     => 'nullable|email|unique:customers,email,' . $customer->id,
                'phone'     => ['nullable', 'regex:/^(0|233)\d{9}$/'],
                'status'    => 'required|in:active,inactive,suspended',
                'password'  => 'nullable|string|min:6',
            ]);

            // 📞 Normalize phone numbers
            if (!empty($validated['phone'])) {
                $phone = preg_replace('/\D/', '', $validated['phone']);
                if (str_starts_with($phone, '0')) {
                    $validated['phone'] = '233' . substr($phone, 1);
                } elseif (!str_starts_with($phone, '233')) {
                    $validated['phone'] = '233' . $phone;
                }
            }

            // 🔑 Only update password if field provided
            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            $customer->update($validated);

            ActivityLogger::log('Updated Customer Login', "Superadmin updated {$customer->full_name}'s login info.");

            return redirect()->route('superadmin.manage-customers.index')
                ->with('success', "✅ {$customer->full_name}'s account updated successfully.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update customer.');
        }
    }

    /** 🔁 Resend credentials */
    public function resendCredentials(Customer $customer)
    {
        try {
            $newPassword = Str::random(8);
            $customer->update(['password' => bcrypt($newPassword)]);

            ActivityLogger::log('Resent Customer Credentials', "Superadmin resent credentials to {$customer->full_name}");

            Log::info("📤 Resending credentials to {$customer->email} / {$customer->phone}");

            $this->notifyCustomer($customer, $newPassword, 'resent');

            return back()->with('success', "✅ Credentials resent to {$customer->full_name} (email & SMS).");
        } catch (\Throwable $e) {
            return $this->handleError($e, '❌ Failed to resend credentials.');
        }
    }

    /** 🚫 Soft delete customer */
    public function destroy(Customer $customer)
    {
        try {
            $customer->delete();

            ActivityLogger::log('Soft Deleted Customer', "Superadmin soft-deleted {$customer->full_name}");

            return back()->with('success', "✅ {$customer->full_name} moved to trash.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to delete customer.');
        }
    }

    /** ♻️ Restore customer */
    public function restore($id)
    {
        try {
            $customer = Customer::onlyTrashed()->findOrFail($id);
            $customer->restore();

            ActivityLogger::log('Restored Customer', "Superadmin restored {$customer->full_name}");

            return back()->with('success', "✅ {$customer->full_name} restored successfully.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to restore customer.');
        }
    }

    /** ❌ Permanently delete customer */
    public function forceDelete($id)
    {
        try {
            $customer = Customer::onlyTrashed()->findOrFail($id);
            $name = $customer->full_name;

            $customer->forceDelete();

            ActivityLogger::log('Permanently Deleted Customer', "Superadmin permanently deleted {$name}");

            return back()->with('success', "🗑️ {$name} permanently deleted.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to permanently delete customer.');
        }
    }

    /** ✉️ Notify customer (email + SMS) */
    private function notifyCustomer(Customer $customer, string $password, string $type = 'created'): void
    {
        try {
            // ✉️ Email notification
            if (!empty($customer->email)) {
                $mailable = $type === 'created'
                    ? new CustomerWelcomeMail($customer)
                    : new CustomerLoginMail($customer, $customer->email, $password);

                Mail::to($customer->email)->send($mailable);
                Log::info("✅ Email sent successfully to {$customer->email}");
            }

            // 📱 SMS notification
            if (!empty($customer->phone)) {
                $message = $type === 'created'
                    ? "Hi {$customer->full_name}, welcome to Joelaar Micro-Credit! Your account has been created.\nEmail: {$customer->email}\nPassword: {$password}\nLogin: " . url('/login')
                    : "Hi {$customer->full_name}, your login credentials have been reset.\nEmail: {$customer->email}\nPassword: {$password}\nLogin: " . url('/login');

                try {
                    $sent = SmsNotifier::send($customer->phone, $message);

                    if (!$sent) {
                        Log::warning("⚠️ SMS failed to send to {$customer->phone}");
                    } else {
                        Log::info("✅ SMS sent successfully to {$customer->phone}");
                    }
                } catch (\Throwable $smsError) {
                    Log::error("❌ SMS exception for {$customer->phone}: " . $smsError->getMessage());
                }
            }
        } catch (\Throwable $notifyError) {
            Log::warning('⚠️ Customer notification failed', [
                'customer' => $customer->email,
                'error' => $notifyError->getMessage(),
            ]);
        }
    }

    /** ⚙️ Central error handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ ManageCustomerController Error', [
            'user'  => auth()->user()?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return back()->with('error', $message);
    }
}