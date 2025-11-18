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
        $status = $request->input('status', 'active');

        if (!in_array($status, ['active', 'inactive', 'suspended', 'all'])) {
            $status = 'active';
        }

        $query = Customer::with('loans')
            ->when($status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('community', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at');

        $customers = $query->paginate(10)->withQueryString();

        $activeCount = Customer::where('status', 'active')->count();
        $inactiveCount = Customer::where('status', 'inactive')->count();
        $suspendedCount = Customer::where('status', 'suspended')->count();

        return Inertia::render('Admin/Customers/Index', [
            'auth' => ['user' => $request->user()],
            'customers' => $customers->items(),
            'pagination' => $customers->toArray(),

            'counts' => [
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
     * ➕ Create customer form (ADMIN ONLY)
     */
    public function create()
    {
        if (auth()->user()->role === 'superadmin') {
            return back()->with('error', 'Superadmin cannot create customers.');
        }

        return Inertia::render('Admin/Customers/Create', [
            'auth' => ['user' => auth()->user()],
            'basePath' => 'admin',
        ]);
    }

    /**
     * 💾 Store new customer (ADMIN ONLY)
     */
    public function store(Request $request)
    {
        if (auth()->user()->role === 'superadmin') {
            return back()->with('error', 'Superadmin cannot create customers.');
        }

        $validated = $this->validateCustomer($request);

        if (!empty($validated['gender'])) {
            $g = strtolower(trim($validated['gender']));
            $validated['gender'] = in_array($g, ['male', 'm']) ? 'M' :
                                   (in_array($g, ['female', 'f']) ? 'F' : null);
        }

        DB::beginTransaction();
        try {
            $customer = Customer::create($validated);

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
     * 👁️ Show customer (SUPERADMIN CAN VIEW)
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
     * ✏️ Edit customer (ADMIN ONLY)
     */
    public function edit(Customer $customer)
    {
        if (auth()->user()->role === 'superadmin') {
            return back()->with('error', 'Superadmin cannot edit customers.');
        }

        $customer->load('guarantors');

        return Inertia::render('Admin/Customers/Edit', [
            'auth' => ['user' => auth()->user()],
            'customer' => $customer,
            'basePath' => 'admin',
        ]);
    }

    /**
     * 🔄 Update customer (ADMIN ONLY)
     */
    public function update(Request $request, Customer $customer)
    {
        if (auth()->user()->role === 'superadmin') {
            return back()->with('error', 'Superadmin cannot update customers.');
        }

        $validated = $this->validateCustomer($request, $customer->id);

        if (!empty($validated['gender'])) {
            $g = strtolower(trim($validated['gender']));
            $validated['gender'] = in_array($g, ['male', 'm']) ? 'M' :
                                   (in_array($g, ['female', 'f']) ? 'F' : null);
        }

        DB::beginTransaction();
        try {
            $customer->update($validated);

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

    /**
     * 🟡 SUSPEND / REACTIVATE CUSTOMER (ADMIN ONLY)
     */
    public function toggleSuspend(Request $request, Customer $customer)
    {
        $user = auth()->user();

        if ($user->role === 'superadmin') {
            return back()->with('error', 'Superadmin cannot suspend customers.');
        }

        if ($user->role !== 'admin') {
            return back()->with('error', 'Only admin can change customer status.');
        }

        $request->validate([
            'confirm_name' => 'required|string|max:255',
        ]);

        // 🔥 EXACT MATCH — NO strtolower()
        if (trim($request->confirm_name) !== trim($customer->full_name)) {
            return back()->with('error', 'Name does not match. Status was NOT changed.');
        }

        $newStatus = $customer->status === 'suspended' ? 'active' : 'suspended';

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
     * ❌ PERMANENT DELETE CUSTOMER (ADMIN ONLY)
     */
    public function destroy(Request $request, Customer $customer)
    {
        $user = auth()->user();

        if ($user->role === 'superadmin') {
            return back()->with('error', 'Superadmin cannot delete customers.');
        }

        if ($user->role !== 'admin') {
            return back()->with('error', 'You do not have permission to delete customers.');
        }

        $request->validate([
            'confirm_name' => 'required|string|max:255',
        ]);

        // 🔥 EXACT MATCH — NO strtolower()
        if (trim($request->confirm_name) !== trim($customer->full_name)) {
            return back()->with('error', 'Name does not match. Customer was NOT deleted.');
        }

        DB::beginTransaction();
        try {
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