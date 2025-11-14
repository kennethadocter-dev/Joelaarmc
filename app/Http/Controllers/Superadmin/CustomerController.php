<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Helpers\ActivityLogger;

class CustomerController extends Controller
{
    public function __construct()
    {
        // ✅ Restrict access to Superadmin only
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user || $user->role !== 'superadmin') {
                abort(403, 'Access denied. Only Superadmins can manage customers.');
            }
            return $next($request);
        });
    }

    /** 📋 List all customers with optional filters */
    public function index(Request $request)
    {
        try {
            $q = $request->query('q');
            $status = $request->query('status');

            $query = Customer::with(['loans', 'guarantors'])
                ->when($q, function ($qBuilder) use ($q) {
                    $qBuilder->where(function ($sub) use ($q) {
                        $sub->where('full_name', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%")
                            ->orWhere('community', 'like', "%{$q}%");
                    });
                })
                ->when($status && in_array($status, ['active', 'inactive', 'suspended']), function ($qBuilder) use ($status) {
                    $qBuilder->where('status', $status);
                })
                ->latest();

            $customers = $query->get();

            // 📊 Status counts
            $counts = [
                'Active'    => Customer::where('status', 'active')->count(),
                'Inactive'  => Customer::where('status', 'inactive')->count(),
                'Suspended' => Customer::where('status', 'suspended')->count(),
                'Total'     => Customer::count(),
            ];

            ActivityLogger::log('Viewed Customers', 'Superadmin viewed customer list.');

            return Inertia::render('Superadmin/Customers/Index', [
                'customers' => $customers,
                'counts'    => $counts,
                'filters'   => [
                    'q'      => $q,
                    'status' => $status,
                ],
                'auth' => ['user' => auth()->user()],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load customers.');
        }
    }

    /** 👁 View a single customer with relationships */
    public function show(Customer $customer)
    {
        try {
            $customer->load(['loans', 'guarantors']);

            ActivityLogger::log('Viewed Customer', "Superadmin viewed {$customer->full_name}.");

            return Inertia::render('Superadmin/Customers/Show', [
                'customer' => $customer,
                'auth'     => ['user' => auth()->user()],
                'flash'    => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load customer details.');
        }
    }

    /** ✏️ Edit customer info */
    public function edit(Customer $customer)
    {
        try {
            ActivityLogger::log('Editing Customer', "Superadmin opened edit form for {$customer->full_name}.");

            return Inertia::render('Superadmin/Customers/Edit', [
                'customer' => $customer,
                'auth'     => ['user' => auth()->user()],
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load edit form.');
        }
    }

    /** 💾 Update customer details */
    public function update(Request $request, Customer $customer)
    {
        try {
            $validated = $request->validate([
                'full_name'  => 'required|string|max:255',
                'phone'      => 'nullable|string|max:50',
                'community'  => 'nullable|string|max:255',
                'status'     => 'required|in:active,inactive,suspended',
            ]);

            $customer->update($validated);

            ActivityLogger::log('Updated Customer', "Superadmin updated {$customer->full_name}.");

            return redirect()->route('superadmin.customers.index')
                ->with('success', "✅ {$customer->full_name} updated successfully.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update customer.');
        }
    }

    /** 🚫 Superadmin cannot create customers */
    public function create()
    {
        return back()->with('error', '⚠️ Superadmin cannot create new customers.');
    }

    /** 🚫 Superadmin cannot store customers */
    public function store()
    {
        return back()->with('error', '⚠️ Superadmin cannot create new customers.');
    }

    /** 🚫 Superadmin cannot delete customers */
    public function destroy()
    {
        return back()->with('error', '⚠️ Superadmin cannot delete customers.');
    }

    /** 🔍 Quick AJAX search (autocomplete) */
    public function search(Request $request)
    {
        $term = $request->query('term', '');

        $results = Customer::where('full_name', 'like', "%{$term}%")
            ->orWhere('phone', 'like', "%{$term}%")
            ->limit(10)
            ->get(['id', 'full_name', 'phone']);

        return response()->json($results);
    }

    /** ⚙️ Centralized Error Handler */
    private function handleError(\Throwable $e, string $message)
    {
        Log::error('❌ Superadmin CustomerController Error', [
            'user'  => auth()->user()?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route('superadmin.customers.index')->with('error', $message);
    }
}