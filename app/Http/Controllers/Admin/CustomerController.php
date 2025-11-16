<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Guarantor;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * 🧭 Display all customers (with search + status filter)
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', 'active'); // default = active

        // Normalise / guard status
        if (!in_array($status, ['active', 'inactive', 'suspended', 'all'])) {
            $status = 'active';
        }

        $query = Customer::with('loans')
            // Status filter
            ->when($status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            })
            // Search filter
            ->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('community', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at');

        $customers = $query->paginate(10)->withQueryString();

        // Global counts (for cards)
        $activeCount = Customer::where('status', 'active')->count();
        $inactiveCount = Customer::where('status', 'inactive')->count();
        $suspendedCount = Customer::where('status', 'suspended')->count();

        return Inertia::render('Admin/Customers/Index', [
            'auth' => ['user' => $request->user()],
            'customers' => $customers->items(),
            'pagination' => $customers->toArray(),

            'counts' => [
                // All = active + inactive + suspended
                'total'     => $activeCount + $inactiveCount + $suspendedCount,
                'active'    => $activeCount,
                'inactive'  => $inactiveCount,
                'suspended' => $suspendedCount,
            ],

            'filters' => [
                'search' => $search,
                'status' => $status,
            ],

            'basePath' => 'admin',
        ]);
    }

    /**
     * ➕ Create customer form
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

        // Normalize gender
        if (!empty($validated['gender'])) {
            $g = strtolower(trim($validated['gender']));
            $validated['gender'] = in_array($g, ['male', 'm']) ? 'M' :
                                   (in_array($g, ['female', 'f']) ? 'F' : null);
        }

        DB::beginTransaction();
        try {
            $customer = Customer::create($validated);

            // Save guarantors
            foreach ($request->guarantors ?? [] as $g) {
                if (!empty($g['name'])) {
                    Guarantor::create([
                        'customer_id' => $customer->id,
                        'name' => $g['name'],
                        'occupation' => $g['occupation'] ?? '',
                        'residence' => $g['residence'] ?? '',
                        'contact' => $g['contact'] ?? '',
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('admin.loans.create', [
                'customer_id' => $customer->id,
                'client_name' => $customer->full_name,
            ])->with('success', 'Customer created successfully.');

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Customer creation failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to create customer.');
        }
    }

    /**
     * 👁️ Show customer
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
     * ✏️ Edit customer
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
     * 🔄 Update customer
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $this->validateCustomer($request, $customer->id);

        if (!empty($validated['gender'])) {
            $g = strtolower(trim($validated['gender']));
            $validated['gender'] = in_array($g, ['male', 'm']) ? 'M' :
                                   (in_array($g, ['female', 'f']) ? 'F' : null);
        }

        DB::beginTransaction();
        try {
            $customer->update($validated);

            // Update guarantors
            $customer->guarantors()->delete();
            foreach ($request->guarantors ?? [] as $g) {
                if (!empty($g['name'])) {
                    Guarantor::create([
                        'customer_id' => $customer->id,
                        'name' => $g['name'],
                        'occupation' => $g['occupation'] ?? '',
                        'residence' => $g['residence'] ?? '',
                        'contact' => $g['contact'] ?? '',
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('admin.customers.edit', $customer->id)
                ->with('success', 'Customer updated successfully.');

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Customer update failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update customer.');
        }
    }

    /* ============================================================
       🟡 SUSPEND / REACTIVATE CUSTOMER (with name confirmation)
       ============================================================ */
    public function toggleSuspend(Request $request, Customer $customer)
    {
        $user = auth()->user();

        // Only admin can suspend / reactivate
        if ($user->role !== 'admin') {
            return back()->with('error', 'Only admin can change customer status.');
        }

        // Confirm name typed in modal
        $request->validate([
            'confirm_name' => 'required|string|max:255',
        ]);

        if (
            trim(strtolower($request->confirm_name)) !==
            trim(strtolower($customer->full_name))
        ) {
            return back()->with('error', 'Name does not match. Status was NOT changed.');
        }

        // Toggle status
        $newStatus = $customer->status === 'suspended'
            ? 'active'
            : 'suspended';

        $customer->status = $newStatus;
        $customer->save();

        return back()->with(
            'success',
            $newStatus === 'suspended'
                ? 'Customer has been suspended.'
                : 'Customer has been reactivated.'
        );
    }

    /**
     * ❌ PERMANENT DELETE CUSTOMER — Requires name confirmation
     */
    public function destroy(Request $request, Customer $customer)
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'superadmin'])) {
            return back()->with('error', 'You do not have permission to delete customers.');
        }

        // Validate typed name
        $request->validate([
            'confirm_name' => 'required|string|max:255',
        ]);

        // Compare entered name with full_name
        if (
            trim(strtolower($request->confirm_name)) !==
            trim(strtolower($customer->full_name))
        ) {
            return back()->with('error', 'Name does not match. Customer was NOT deleted.');
        }

        DB::beginTransaction();
        try {
            // Permanently delete using your model helper
            $success = $customer->forceDeleteFully();

            if (!$success) {
                throw new \Exception("Force delete failed");
            }

            DB::commit();

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customer permanently deleted.');

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Delete failed', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);

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
        ]);
    }
}