<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Guarantor;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Helpers\SmsNotifier;
use App\Mail\WelcomeCustomerMail;
use App\Jobs\SendCustomerWelcomeAndLogin;

class CustomerController extends Controller
{
    /**
     * 🧭 Display all customers
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $query = Customer::with('loans')
            ->when($search, function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('community', 'like', "%{$search}%");
            })
            ->orderByDesc('created_at');

        $customers = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'auth' => ['user' => $request->user()],
            'customers' => $customers->items(),
            'pagination' => $customers->toArray(),
            'counts' => [
                'total' => Customer::count(),
                'with_loans' => Customer::has('loans')->count(),
                'without_loans' => Customer::doesntHave('loans')->count(),
            ],
            'filters' => ['search' => $search],
            'basePath' => 'admin',
        ]);
    }

    /**
     * ➕ Show customer creation form
     */
    public function create()
    {
        return Inertia::render('Admin/Customers/Create', [
            'auth' => ['user' => auth()->user()],
            'basePath' => 'admin',
        ]);
    }

    /**
     * 💾 Store new customer
     */
    public function store(Request $request)
    {
        $validated = $this->validateCustomer($request);

        // ✅ Normalize gender
        if (!empty($validated['gender'])) {
            $gender = strtolower(trim($validated['gender']));
            $validated['gender'] = in_array($gender, ['male', 'm']) ? 'M' :
                                   (in_array($gender, ['female', 'f']) ? 'F' : null);
        }

        DB::beginTransaction();
        try {
            // 1️⃣ Create Customer
            $customer = Customer::create($validated);

            // 2️⃣ Create Guarantors (optional)
            $guarantors = $request->input('guarantors', []);
            if (is_array($guarantors) && count($guarantors) > 0) {
                foreach ($guarantors as $g) {
                    if (!empty($g['name'])) {
                        Guarantor::create([
                            'customer_id' => $customer->id,
                            'name' => $g['name'] ?? '',
                            'occupation' => $g['occupation'] ?? '',
                            'residence' => $g['residence'] ?? '',
                            'contact' => $g['contact'] ?? '',
                        ]);
                    }
                }
            }

            // 3️⃣ Notifications
            try {
                // 🔸 If customer has email — send login + welcome mails via queued job
                if (!empty($customer->email)) {
                    // Generate a simple random password for login credentials
                    $plainPassword = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8);

                    // Dispatch background job to send all notifications
                    dispatch(new SendCustomerWelcomeAndLogin(
                        $customer,
                        $customer->email,
                        $plainPassword
                    ));

                    Log::info('📨 Customer welcome & login job dispatched', [
                        'customer_id' => $customer->id,
                        'email' => $customer->email,
                    ]);
                } else {
                    // 📱 No email provided — send SMS only
                    if (!empty($customer->phone)) {
                        $msg = "Hi {$customer->full_name}, welcome to Joelaar Micro-Credit! Your record has been created successfully.";
                        SmsNotifier::send($customer->phone, $msg);
                    }
                }
            } catch (\Throwable $notifyEx) {
                Log::warning('⚠️ Customer notification failed', [
                    'customer_id' => $customer->id,
                    'error' => $notifyEx->getMessage(),
                ]);
            }

            DB::commit();

            // 4️⃣ Redirect to Loan Creation
            return redirect()->route('admin.loans.create', [
                'customer_id' => $customer->id,
                'client_name' => $customer->full_name,
                'amount_requested' => $customer->loan_amount_requested,
            ])->with([
                'success' => 'Customer added successfully! Redirecting to loan creation...',
                'customer' => $customer,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('❌ Customer creation failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
            ]);
            if (config('app.debug')) {
                return back()->with('error', 'Error: ' . $e->getMessage());
            }
            return back()->with('error', 'Failed to create customer. Please try again.');
        }
    }

    /**
     * 👁️ View single customer
     */
    public function show(Customer $customer, Request $request)
    {
        $customer->load(['loans', 'guarantors']);

        return Inertia::render('Admin/Customers/Show', [
            'auth' => ['user' => $request->user()],
            'customer' => $customer,
            'basePath' => 'admin',
        ]);
    }

    /**
     * ✏️ Edit customer form
     */
    public function edit(Customer $customer)
    {
        $customer->load('guarantors');

        return Inertia::render('Admin/Customers/Edit', [
            'auth' => ['user' => auth()->user()],
            'customer' => $customer,
            'basePath' => 'admin',
        ]);
    }

    /**
     * 🔄 Update customer info
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $this->validateCustomer($request, $customer->id);

        // ✅ Normalize gender before update
        if (!empty($validated['gender'])) {
            $gender = strtolower(trim($validated['gender']));
            $validated['gender'] = in_array($gender, ['male', 'm']) ? 'M' :
                                   (in_array($gender, ['female', 'f']) ? 'F' : null);
        }

        DB::beginTransaction();
        try {
            $customer->update($validated);

            // 🔁 Update Guarantors (optional)
            $customer->guarantors()->delete();
            $guarantors = $request->input('guarantors', []);
            if (is_array($guarantors) && count($guarantors) > 0) {
                foreach ($guarantors as $g) {
                    if (!empty($g['name'])) {
                        Guarantor::create([
                            'customer_id' => $customer->id,
                            'name' => $g['name'] ?? '',
                            'occupation' => $g['occupation'] ?? '',
                            'residence' => $g['residence'] ?? '',
                            'contact' => $g['contact'] ?? '',
                        ]);
                    }
                }
            }

            DB::commit();
            return redirect()->route('admin.customers.edit', $customer->id)
                ->with('success', 'Customer updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('❌ Error updating customer', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            if (config('app.debug')) {
                return back()->with('error', 'Error: ' . $e->getMessage());
            }
            return back()->with('error', 'Failed to update customer.');
        }
    }

    /**
     * ❌ Delete customer (restricted to Admin + Superadmin)
     */
    public function destroy(Customer $customer)
    {
        $user = auth()->user();

        // 🚫 Restrict Staff from deleting
        if ($user->role === 'staff') {
            return back()->with('error', 'You do not have permission to delete customers.');
        }

        try {
            $customer->guarantors()->delete();
            $customer->delete();

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customer deleted successfully.');
        } catch (\Throwable $e) {
            Log::error('❌ Error deleting customer', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            if (config('app.debug')) {
                return back()->with('error', 'Error: ' . $e->getMessage());
            }
            return back()->with('error', 'Failed to delete customer.');
        }
    }

    /**
     * 📋 Validation rules
     */
    private function validateCustomer(Request $request, $id = null)
    {
        return $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone,' . ($id ?? 'NULL'),
            'email' => 'nullable|email|max:255|unique:customers,email,' . ($id ?? 'NULL'),
            'marital_status' => 'nullable|string|max:50',
            'gender' => 'nullable|string|max:20',
            'house_no' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'community' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'postal_address' => 'nullable|string|max:255',
            'workplace' => 'nullable|string|max:255',
            'profession' => 'nullable|string|max:255',
            'employer' => 'nullable|string|max:255',
            'bank' => 'nullable|string|max:255',
            'bank_branch' => 'nullable|string|max:255',
            'has_bank_loan' => 'boolean',
            'bank_monthly_deduction' => 'nullable|numeric',
            'take_home' => 'nullable|numeric',
            'loan_amount_requested' => 'nullable|numeric',
            'loan_purpose' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive,suspended',
            'guarantors' => 'nullable|array',
            'guarantors.*.name' => 'nullable|string|max:255',
            'guarantors.*.occupation' => 'nullable|string|max:255',
            'guarantors.*.residence' => 'nullable|string|max:255',
            'guarantors.*.contact' => 'nullable|string|max:255',
        ], [
            'email.unique' => 'This email address is already in use.',
            'phone.unique' => 'This phone number is already registered.',
        ]);
    }
}