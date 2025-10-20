import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function EditUser() {
    const { user, flash, errors: pageErrors } = usePage().props;

    // 🧠 Form state (includes optional password reset)
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        password: "",
    });

    // ✅ Toast states
    const [toastMessage, setToastMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // 🎉 Success toast handler
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setTimeout(() => setToastMessage(null), 3000);
        }
    }, [flash]);

    // 🔥 Error toast handler
    useEffect(() => {
        if (pageErrors?.role || errors?.role) {
            setErrorMessage(pageErrors.role || errors.role);
            setTimeout(() => setErrorMessage(null), 4000);
        }
    }, [pageErrors, errors]);

    // 📤 Submit update form
    const submit = (e) => {
        e.preventDefault();
        patch(route("users.update", user.id));
    };

    return (
        <AuthenticatedLayout header={`Edit ${user.name}`}>
            <Head title={`Edit User - ${user.name}`} />

            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* ✅ Success Toast */}
                {toastMessage && (
                    <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-lg animate-fade-in">
                        {toastMessage}
                    </div>
                )}

                {/* 🔥 Error Toast */}
                {errorMessage && (
                    <div className="fixed top-5 right-5 bg-red-600 text-white px-4 py-3 rounded shadow-lg animate-fade-in">
                        {errorMessage}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        ✏️ Edit User
                    </h2>

                    <form onSubmit={submit} className="space-y-6">
                        {/* 🧑‍💻 Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* 📧 Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* 🛡️ Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData("role", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                                <option value="user">User</option>
                            </select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>

                        {/* 🔑 Password Reset */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password <span className="text-sm text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                placeholder="Leave blank to keep current password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* 📍 Action Buttons */}
                        <div className="flex justify-between items-center">
                            <Link
                                href={route("users.index")}
                                className="text-gray-600 dark:text-gray-300 hover:underline"
                            >
                                ← Back to Users
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
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