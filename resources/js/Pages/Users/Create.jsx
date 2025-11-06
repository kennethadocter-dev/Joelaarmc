import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { useState } from "react";

export default function CreateUser() {
    const { auth, basePath: propBase = "admin" } = usePage().props;

    // ✅ Automatically pick correct base path
    const basePath =
        auth?.user?.role === "superadmin" ? "superadmin" : propBase;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role: "user",
    });

    const [toast, setToast] = useState(null);
    const [toastColor, setToastColor] = useState("bg-green-600");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.password !== data.password_confirmation) {
            setToast("⚠️ Passwords do not match!");
            setToastColor("bg-red-600");
            setTimeout(() => setToast(null), 2500);
            return;
        }

        post(route(`${basePath}.users.store`), {
            onSuccess: () => {
                reset();
                setToast("✅ User created successfully!");
                setToastColor("bg-green-600");
                setTimeout(() => setToast(null), 2500);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                setToast(`⚠️ ${firstError || "Failed to create user."}`);
                setToastColor("bg-red-600");
                setTimeout(() => setToast(null), 3000);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Create New User
                </h2>
            }
        >
            <Head title="Create User" />

            {/* ✅ Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-50 ${toastColor} text-white px-4 py-3 rounded-lg shadow-lg transition-opacity duration-300`}
                >
                    {toast}
                </div>
            )}

            {/* 🧩 Main Form Card */}
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Create User
                    </h2>
                    <Link
                        href={route(`${basePath}.users.index`)}
                        className="text-blue-600 hover:underline"
                    >
                        ← Back
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 👤 Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* 📞 Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 0541234567 or 233541234567"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* 📧 Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* 🔒 Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* 🔒 Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    {/* 🏷️ Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            {/* ✅ Allow Superadmin to create Superadmins */}
                            {auth?.user?.role === "superadmin" && (
                                <option value="superadmin">Superadmin</option>
                            )}
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    {/* ✅ Submit */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {processing ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
