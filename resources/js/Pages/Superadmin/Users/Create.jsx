import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Create() {
    const { props } = usePage();
    const authUser = props?.auth?.user || {};
    const role = authUser?.role || "superadmin";

    // ✅ Determine correct base path
    const basePath =
        role === "superadmin"
            ? "superadmin"
            : role === "admin"
              ? "admin"
              : "staff";

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        role: role === "superadmin" ? "admin" : "staff", // default role suggestion
        password: "",
        password_confirmation: "",
    });

    const [toast, setToast] = useState(null);

    // 🕒 Auto-clear toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Normalize Ghanaian phone number
        let normalizedData = { ...data };
        if (normalizedData.phone) {
            let phone = normalizedData.phone.replace(/\D/g, "");
            if (phone.startsWith("0")) phone = "233" + phone.slice(1);
            else if (!phone.startsWith("233")) phone = "233" + phone;
            normalizedData.phone = phone;
        }

        post(route(`${basePath}.users.store`), {
            data: normalizedData,
            preserveScroll: true,
            onSuccess: () => {
                setToast("✅ User created successfully!");
                reset();
            },
            onError: () => {
                setToast("❌ Failed to create user. Please check inputs.");
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {role === "superadmin"
                        ? "Add New System User"
                        : "Add New Staff Member"}
                </h2>
            }
        >
            <Head title="Add User" />

            {/* ✅ Toast Message */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md animate-fade-in">
                    {toast}
                </div>
            )}

            <div className="max-w-3xl mx-auto py-8 px-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ➕ Create User Account
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 🧍 Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Enter full name"
                                required
                                className="mt-1 block w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* 📧 Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email (optional)
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="e.g. user@example.com"
                                className="mt-1 block w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* ☎️ Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number (optional)
                            </label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                placeholder="e.g. 0541234567 or 233541234567"
                                pattern="^(0|233)\d{9}$"
                                title="Enter a valid Ghanaian phone number"
                                className="mt-1 block w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* 🧩 Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) =>
                                    setData("role", e.target.value)
                                }
                                className="mt-1 block w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                            >
                                {role === "superadmin" && (
                                    <option value="admin">Admin</option>
                                )}
                                <option value="staff">Staff</option>
                                <option value="user">User</option>
                            </select>
                            {errors.role && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* 🔑 Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password (optional)
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Leave blank to auto-generate"
                                    className="mt-1 block w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Confirm password"
                                    className="mt-1 block w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                />
                            </div>
                        </div>

                        {/* ✅ Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                            <Link
                                href={route(`${basePath}.users.index`)}
                                className="text-gray-600 dark:text-gray-300 hover:underline"
                            >
                                ← Back to Users
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition"
                            >
                                {processing ? "Creating..." : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
