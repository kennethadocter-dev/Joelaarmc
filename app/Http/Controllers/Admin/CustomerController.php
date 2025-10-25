<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ActivityLogger;
use App\Helpers\SmsNotifier;
use App\Mail\CustomerWelcomeMail;
use App\Mail\CustomerLoginMail;

class CustomerController extends Controller
{
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    /** 📋 List customers */
    public function index(Request $request)
    {
        try {
            $q = trim((string)$request->get('q', ''));
            $status = $request->get('status', 'all');

            // Auto-refresh customer status
            Customer::whereNot('status', 'suspended')->each(function ($customer) {
                $hasUnpaidLoan = $customer->loans()
                    ->where(function ($q) {
                        $q->where('status', '!=', 'paid')
                            ->orWhere('amount_remaining', '>', 0);
                    })
                    ->exists();

                $newStatus = $hasUnpaidLoan ? 'active' : 'inactive';
                if ($customer->status !== $newStatus) {
                    $customer->update(['status' => $newStatus]);
                }
            });

            $customers = Customer::query()
                ->with('loans:id,customer_id,status,amount_remaining')
                ->when($q, function ($query) use ($q) {
                    $query->where(function ($sub) use ($q) {
                        $sub->where('full_name', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%")
                            ->orWhere('community', 'like', "%{$q}%");
                    });
                })
                ->when($status && $status !== 'all', fn($query) => $query->where('status', $status))
                ->orderByDesc('created_at')
                ->get(['id', 'full_name', 'phone', 'community', 'location', 'status', 'created_at']);

            $counts = [
                'total'      => Customer::count(),
                'active'     => Customer::where('status', 'active')->count(),
                'inactive'   => Customer::where('status', 'inactive')->count(),
                'suspended'  => Customer::where('status', 'suspended')->count(),
            ];

            return Inertia::render('Admin/Customers/Index', [
                'customers' => $customers,
                'counts'    => $counts,
                'filters'   => ['q' => $q, 'status' => $status],
                'flash'     => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
                'auth'      => ['user' => auth()->user()],
                'basePath'  => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load customers list.');
        }
    }

    /** ➕ Create form */
    public function create()
    {
        try {
            return Inertia::render('Admin/Customers/Create', [
                'auth' => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Could not open customer creation form.');
        }
    }

    /** 💾 Store new customer + welcome email + SMS */
    public function store(Request $request)
    {
        try {
            // Normalize phone number
            $phone = preg_replace('/\D/', '', (string)$request->input('phone', ''));
            if ($phone) {
                if (str_starts_with($phone, '0')) {
                    $phone = '233' . substr($phone, 1);
                } elseif (!str_starts_with($phone, '233')) {
                    $phone = '233' . $phone;
                }
                $request->merge(['phone' => $phone]);
            }

            // Clean guarantors
            $guarantors = collect($request->input('guarantors', []))
                ->filter(fn($g) => trim((string)($g['name'] ?? '')) !== '')
                ->values()
                ->all();
            $request->merge(['guarantors' => $guarantors]);

            $validator = Validator::make($request->all(), [
                'full_name' => ['required', 'string', 'max:255'],
                'phone'     => 'nullable|string|max:50',
                'email'     => 'nullable|email|max:255',
                'community' => 'nullable|string|max:255',
                'location'  => 'nullable|string|max:255',
                'status'    => 'nullable|in:active,inactive,suspended',
                'guarantors'               => 'nullable|array|max:5',
                'guarantors.*.name'        => 'required|string|max:255',
                'guarantors.*.occupation'  => 'nullable|string|max:255',
                'guarantors.*.residence'   => 'nullable|string|max:255',
                'guarantors.*.contact'     => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();
            $customer = Customer::create(array_merge($validated, [
                'status' => $validated['status'] ?? 'inactive',
            ]));

            foreach ($validated['guarantors'] ?? [] as $g) {
                $customer->guarantors()->create($g);
            }

            // 🔐 Create linked user + notify
            $plainPassword = Str::random(8);
            $loginEmail = $customer->email ?: (Str::slug($customer->full_name) . '@joelaar.local');

            try {
                $user = User::firstOrCreate(
                    ['email' => $loginEmail],
                    [
                        'name'     => $customer->full_name,
                        'phone'    => $customer->phone,
                        'password' => Hash::make($plainPassword),
                        'role'     => 'user',
                    ]
                );

                // 📨 Email (Welcome + Login)
                if (!empty($customer->email)) {
                    Mail::to($customer->email)->send(new CustomerWelcomeMail($customer));
                    Mail::to($customer->email)->send(new CustomerLoginMail($customer, $user->email, $plainPassword));
                }

                // 💬 SMS: send credentials
               if (!empty($customer->phone)) {
                $settings = \App\Models\Setting::first();
                $companyName = $settings?->company_name ?? 'Joelaar Micro-Credit';

                $msg = "Welcome {$customer->full_name}! 🎉 Your {$companyName} login is ready.
            Email: {$user->email}
            Password: {$plainPassword}
            Login: " . url('/login');

                SmsNotifier::send($customer->phone, $msg);
            }
            } catch (\Throwable $e) {
                Log::warning('⚠️ Failed creating linked user', ['error' => $e->getMessage()]);
            }

            ActivityLogger::log('Created Customer', "Customer {$customer->full_name} created by " . auth()->user()->name);

            return redirect()
                ->route($this->basePath() . '.loans.create', [
                    'customer_id' => $customer->id,
                    'client_name' => $customer->full_name,
                ])
                ->with('success', '✅ Customer created successfully and credentials sent.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to create customer.');
        }
    }

    /** 👤 Show profile */
    public function show(Customer $customer)
    {
        try {
            $customer->load('guarantors', 'loans');
            return Inertia::render('Admin/Customers/Show', [
                'customer' => $customer,
                'auth'     => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to load customer profile.');
        }
    }

    /** ✏️ Edit form */
    public function edit($id)
    {
        try {
            $customer = Customer::with('guarantors')->findOrFail($id);
            return Inertia::render('Admin/Customers/Edit', [
                'customer' => $customer,
                'auth'     => ['user' => auth()->user()],
                'basePath' => $this->basePath(),
            ]);
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to open edit form.');
        }
    }

    /** 🔁 Update details */
    public function update(Request $request, $id)
    {
        try {
            $customer = Customer::with('guarantors')->findOrFail($id);

            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'phone'     => 'nullable|string|max:50',
                'email'     => 'nullable|email|max:255',
                'status'    => 'nullable|in:active,inactive,suspended',
                'guarantors' => 'nullable|array|max:5',
                'guarantors.*.name' => 'required|string|max:255',
                'guarantors.*.occupation' => 'nullable|string|max:255',
                'guarantors.*.residence' => 'nullable|string|max:255',
                'guarantors.*.contact' => 'nullable|string|max:255',
            ]);

            $customer->update($validated);

            // Update guarantors
            $incoming = collect($validated['guarantors'] ?? [])->map(fn($g) => [
                'name'       => trim($g['name']),
                'occupation' => $g['occupation'] ?? '',
                'residence'  => $g['residence'] ?? '',
                'contact'    => $g['contact'] ?? '',
            ]);

            foreach ($customer->guarantors as $existing) {
                if (!$incoming->contains('name', $existing->name)) {
                    $existing->delete();
                }
            }

            foreach ($incoming as $g) {
                $customer->guarantors()->updateOrCreate(['name' => $g['name']], $g);
            }

            ActivityLogger::log('Updated Customer', "Customer {$customer->full_name} updated by " . auth()->user()->name);

            return redirect()->route($this->basePath() . '.customers.index')
                ->with('success', '✅ Customer updated successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to update customer.');
        }
    }

    /** 🚫 Suspend manually */
    public function suspend($id)
    {
        try {
            $customer = Customer::with('loans')->findOrFail($id);
            $hasUnpaidLoan = $customer->loans()
                ->where(fn($q) => $q->where('status', '!=', 'paid')->orWhere('amount_remaining', '>', 0))
                ->exists();

            if ($hasUnpaidLoan) {
                return back()->with('error', '⚠️ Cannot suspend a customer with active or unpaid loans.');
            }

            $customer->update(['status' => 'suspended']);
            ActivityLogger::log('Suspended Customer', "Customer {$customer->full_name} suspended by " . auth()->user()->name);

            return back()->with('success', '🚫 Customer suspended successfully.');
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to suspend customer.');
        }
    }

    /** 🔄 Toggle active/inactive */
    public function toggleStatus($id)
    {
        try {
            $customer = Customer::with('loans')->findOrFail($id);
            $hasUnpaidLoan = $customer->loans()
                ->where(fn($q) => $q->where('status', '!=', 'paid')->orWhere('amount_remaining', '>', 0))
                ->exists();

            if ($customer->status === 'active' && $hasUnpaidLoan) {
                return back()->with('error', '⚠️ Cannot mark as inactive — customer has active or unpaid loans.');
            }

            if ($customer->status === 'suspended') {
                $customer->update(['status' => 'inactive']);
            } else {
                $newStatus = $customer->status === 'active' ? 'inactive' : 'active';
                $customer->update(['status' => $newStatus]);
            }

            ActivityLogger::log('Toggled Customer Status', "Customer {$customer->full_name} status changed to {$customer->status} by " . auth()->user()->name);

            return back()->with('success', "🔄 Customer status changed to {$customer->status}.");
        } catch (\Throwable $e) {
            return $this->handleError($e, '⚠️ Failed to toggle customer status.');
        }
    }

    /** 🔍 Search for autocomplete */
    public function search(Request $request)
    {
        try {
            $term = $request->get('q');
            $customers = Customer::where('full_name', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%")
                ->limit(10)
                ->get(['id', 'full_name', 'phone', 'status']);

            return response()->json($customers);
        } catch (\Throwable $e) {
            Log::error('❌ Customer search failed', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    /** 🧰 Unified Safe Error Handler */
    private function handleError(\Throwable $e, string $message)
    {
        $user = auth()->user();
        Log::error('❌ CustomerController Error', [
            'user'  => $user?->email,
            'route' => request()->path(),
            'error' => $e->getMessage(),
        ]);

        return redirect()->route($this->basePath() . '.customers.index')->with('error', $message);
    }
}