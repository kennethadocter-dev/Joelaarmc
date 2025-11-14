import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, usePage } from "@inertiajs/react";

export default function Edit({ user }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user || {};
    const role = currentUser?.role || "superadmin";

    // ✅ Determine correct base path (for routes)
    const basePath =
        role === "superadmin"
            ? "superadmin"
            : role === "admin"
              ? "admin"
              : "staff";

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "staff",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Normalize Ghanaian phone number format
        let normalizedPhone = data.phone?.replace(/\D/g, "") || "";
        if (normalizedPhone.startsWith("0"))
            normalizedPhone = "233" + normalizedPhone.slice(1);
        else if (!normalizedPhone.startsWith("233"))
            normalizedPhone = "233" + normalizedPhone;
        setData("phone", normalizedPhone);

        put(route(`${basePath}.users.update`, user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Edit User
                </h2>
            }
        >
            <Head title={`Edit ${user.name}`} />

            <div className="max-w-3xl mx-auto py-8 px-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ✏️ Update User Details
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
                                required
                                placeholder="Enter full name"
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
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                placeholder="e.g. 0541234567 or 233541234567"
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
                                    <option value="superadmin">
                                        Superadmin
                                    </option>
                                )}
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

                        {/* 🔑 Password (optional) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    New Password (optional)
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Leave blank to keep existing"
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
                                    Confirm New Password
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
                                    placeholder="Re-enter new password"
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
                                {processing ? "Updating..." : "Update User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
