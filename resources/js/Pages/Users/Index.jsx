import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ users, counts, filters, flash }) {
    const { props } = usePage();
    const user = props?.auth?.user || {};
    const basePath = props?.basePath || "superadmin"; // ✅ default superadmin if missing
    const [query, setQuery] = useState(filters?.q || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route(`${basePath}.users.index`),
            { q: query },
            { preserveScroll: true },
        );
    };

    const cardClasses =
        "flex flex-col justify-center items-center p-4 rounded-xl shadow-md transition bg-white border border-gray-200 hover:shadow-lg";

    const roleBadge = (role) => {
        const styles = {
            superadmin: "bg-blue-100 text-blue-800 border border-blue-300",
            admin: "bg-purple-100 text-purple-800 border border-purple-300",
            officer: "bg-teal-100 text-teal-800 border border-teal-300",
            user: "bg-gray-100 text-gray-800 border border-gray-300",
            staff: "bg-amber-100 text-amber-800 border border-amber-300",
        };
        return (
            <span
                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                    styles[role?.toLowerCase()] || styles.user
                }`}
            >
                {role || "User"}
            </span>
        );
    };

    console.log("Base path:", basePath); // ✅ debug

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Manage Users
                </h2>
            }
        >
            <Head title="Manage Users" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* ✅ Flash Messages */}
                {flash?.success && (
                    <div className="p-3 bg-green-100 text-green-800 rounded-md">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-3 bg-red-100 text-red-800 rounded-md">
                        {flash.error}
                    </div>
                )}

                {/* 🧮 Role Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={cardClasses}>
                        <p className="text-gray-500 text-sm">Super Admins</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {counts?.super_admin}
                        </p>
                    </div>
                    <div className={cardClasses}>
                        <p className="text-gray-500 text-sm">Admins</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {counts?.admin}
                        </p>
                    </div>
                    <div className={cardClasses}>
                        <p className="text-gray-500 text-sm">Officers</p>
                        <p className="text-2xl font-bold text-teal-600">
                            {counts?.officer}
                        </p>
                    </div>
                    <div className={cardClasses}>
                        <p className="text-gray-500 text-sm">Users</p>
                        <p className="text-2xl font-bold text-gray-700">
                            {counts?.user}
                        </p>
                    </div>
                </div>

                {/* 🔍 Search Bar + Add Button */}
                <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-3 mt-6"
                >
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 border rounded-md px-3 py-2 bg-white text-gray-900 border-gray-300"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Search
                    </button>

                    {/* ✅ Only superadmins can add users */}
                    {(user?.is_super_admin || user?.role === "superadmin") && (
                        <Link
                            href={route(`${basePath}.users.create`)} // ✅ dynamic fix
                            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            + Add User
                        </Link>
                    )}
                </form>

                {/* 👥 User Table */}
                <div className="overflow-x-auto mt-6 bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                    Name
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                    Email
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                    Phone
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                    Role
                                </th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users?.length > 0 ? (
                                users.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-2 text-gray-800">
                                            {u.name}
                                        </td>
                                        <td className="px-4 py-2 text-gray-700">
                                            {u.email}
                                        </td>
                                        <td className="px-4 py-2 text-gray-700">
                                            {u.phone || "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {roleBadge(u.role)}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {(user?.is_super_admin ||
                                                user?.role ===
                                                    "superadmin") && (
                                                <Link
                                                    href={route(
                                                        `${basePath}.users.edit`,
                                                        u.id,
                                                    )}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-4 py-4 text-center text-gray-500"
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
