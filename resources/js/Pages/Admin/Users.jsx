import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Users() {
    const { users, flash } = usePage().props;

    // ✅ Toast popup state
    const [toastMessage, setToastMessage] = useState(null);

    // 🎉 Show toast whenever flash.success is sent from backend
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setTimeout(() => setToastMessage(null), 3000);
        }
    }, [flash]);

    // 🗑️ Confirm before deleting user
    const handleDelete = (userId) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(route("users.destroy", userId));
        }
    };

    return (
        <AuthenticatedLayout header="User Management">
            <Head title="Users" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* ✅ Toast popup for create/update/delete success */}
                {toastMessage && (
                    <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-lg animate-fade-in">
                        {toastMessage}
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">All Users</h1>
                    <Link
                        href={route("users.create")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        ➕ Create User
                    </Link>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    {/* 👤 Name */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {user.name}
                                        {user.is_super_admin && (
                                            <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                                ⭐ Super Admin
                                            </span>
                                        )}
                                    </td>

                                    {/* 📧 Email */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {user.email}
                                    </td>

                                    {/* 🛡️ Role */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                user.role === "admin"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : user.role === "staff"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* 📆 Created date */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>

                                    {/* ✏️ Edit / 🗑️ Delete buttons */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {user.is_super_admin ? (
                                            <span className="text-gray-400 italic text-xs">Locked 🔒</span>
                                        ) : (
                                            <>
                                                {/* ✅ Edit now navigates to the edit page */}
                                                <Link
                                                    href={route("users.edit", user.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    ✏️ Edit
                                                </Link>

                                                {/* 🗑️ Delete with confirm dialog */}
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}