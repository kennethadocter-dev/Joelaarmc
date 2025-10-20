import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-hot-toast"; // ✅ Toast notifications

export default function UsersIndex() {
    const { users, flash, counts, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.q || "");
    const [roleFilter, setRoleFilter] = useState(filters?.role || "");
    const confirm = useConfirm();

    // 🔍 Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/admin/users",
            { q: search, role: roleFilter },
            { preserveScroll: true },
        );
    };

    // 🎯 Handle role filter toggle
    const handleFilter = (role) => {
        const newRole = roleFilter === role ? "" : role;
        setRoleFilter(newRole);
        router.get(
            "/admin/users",
            { q: search, role: newRole },
            { preserveScroll: true },
        );
    };

    // 🔁 Resend credentials
    const handleResend = (userId) => {
        confirm(
            "Resend Login Details",
            "Are you sure you want to resend login credentials to this user?",
            () => {
                router.post(
                    `/admin/users/${userId}/resend`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            toast.success(
                                "✅ Login credentials resent successfully!",
                            ),
                        onError: () =>
                            toast.error(
                                "❌ Failed to resend login credentials.",
                            ),
                    },
                );
            },
            "warning",
        );
    };

    // 🗑️ Delete user
    const handleDelete = (userId) => {
        confirm(
            "Delete User",
            "This will permanently delete the user and cannot be undone.",
            () => {
                router.delete(`/admin/users/${userId}`, {
                    preserveScroll: true,
                    onSuccess: () =>
                        toast.success("✅ User deleted successfully!"),
                    onError: () => toast.error("❌ Failed to delete user."),
                });
            },
            "danger",
        );
    };

    // 🎨 Role card styles
    const roleStyles = {
        superadmin: {
            gradient: "from-purple-700 to-indigo-700",
            icon: "👑",
            label: "Super Admins",
            count: counts?.superadmin || 0,
        },
        admin: {
            gradient: "from-blue-700 to-sky-600",
            icon: "🧭",
            label: "Admins",
            count: counts?.admin || 0,
        },
        staff: {
            gradient: "from-green-700 to-emerald-600",
            icon: "🧑‍💼",
            label: "Staff",
            count: counts?.staff || 0,
        },
        user: {
            gradient: "from-gray-700 to-gray-500",
            icon: "👥",
            label: "Users",
            count: counts?.user || 0,
        },
    };

    const roleColor = (role) => {
        switch (role) {
            case "superadmin":
                return "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case "admin":
                return "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "staff":
                return "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "user":
                return "bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold">Manage Users</h2>}
        >
            <Head title="Manage Users" />

            <div className="py-6 max-w-7xl mx-auto space-y-6">
                {/* 🔹 Header */}
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        Manage Users
                    </h3>
                    <Link
                        href="/admin/users/create"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        ➕ Add User
                    </Link>
                </div>

                {/* 🌈 Role Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Object.entries(roleStyles).map(
                        ([role, { gradient, icon, label, count }]) => (
                            <button
                                key={role}
                                onClick={() => handleFilter(role)}
                                className={`relative rounded-xl text-left p-5 shadow-md transition transform hover:scale-[1.03] hover:shadow-lg 
                                bg-gradient-to-br ${gradient} text-white 
                                ${roleFilter === role ? "ring-4 ring-offset-2 ring-white dark:ring-blue-400" : ""}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-4xl">{icon}</span>
                                    <h2 className="text-3xl font-bold">
                                        {count}
                                    </h2>
                                </div>
                                <p className="mt-2 text-sm tracking-wide uppercase opacity-90">
                                    {label}
                                </p>
                            </button>
                        ),
                    )}
                </div>

                {/* 🔍 Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-3 mt-6">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Search
                    </button>
                </form>

                {/* 🧾 Users Table */}
                <div className="bg-white dark:bg-gray-800 shadow rounded overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {[
                                    "#",
                                    "Name",
                                    "Email",
                                    "Phone",
                                    "Role",
                                    "Created",
                                    "Actions",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.length ? (
                                users.map((user, i) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <td className="px-4 py-2 text-sm">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {user.email || "—"}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {user.phone || "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColor(user.role)}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 flex flex-wrap gap-3 text-sm">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleResend(user.id)
                                                }
                                                className="text-yellow-600 dark:text-yellow-400 hover:underline"
                                            >
                                                Resend Login
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                                className="text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-6 text-gray-600 dark:text-gray-300"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
