import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";

export default function UsersIndex() {
    const { users, counts, filters, auth } = usePage().props;
    const currentUser = auth?.user || {};
    const role = currentUser.role || "superadmin";

    // Determine route base path
    const basePath =
        role === "superadmin"
            ? "superadmin"
            : role === "admin"
              ? "admin"
              : "staff";

    const [search, setSearch] = useState(filters?.q || "");
    const [roleFilter, setRoleFilter] = useState(filters?.role || "");
    const [sortField, setSortField] = useState(filters?.sort || "created_at");
    const [sortDirection, setSortDirection] = useState(
        filters?.direction || "desc",
    );

    // Refresh user table (used for search/filter/sort)
    const reloadUsers = (params = {}) => {
        router.get(`/${basePath}/users`, params, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        reloadUsers({ q: search, role: roleFilter });
    };

    const handleFilter = (role) => {
        const newRole = roleFilter === role ? "" : role;
        setRoleFilter(newRole);
        reloadUsers({ q: search, role: newRole });
    };

    const handleSort = (field) => {
        let direction = "asc";
        if (sortField === field && sortDirection === "asc") direction = "desc";

        setSortField(field);
        setSortDirection(direction);

        reloadUsers({
            q: search,
            role: roleFilter,
            sort: field,
            direction,
        });
    };

    // 📩 Resend credentials (using native confirm)
    const handleResend = (id) => {
        const ok = window.confirm("Send login credentials again to this user?");
        if (!ok) return;

        router.post(
            route(`${basePath}.users.resendCredentials`, id),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    window.toast?.success?.("📩 Credentials resent."),
                onError: () =>
                    window.toast?.error?.("❌ Failed to resend credentials."),
            },
        );
    };

    // 🗑 Delete user (native confirm + toast)
    const handleDelete = (id) => {
        const ok = window.confirm(
            "Are you sure you want to permanently delete this user?",
        );
        if (!ok) return;

        router.delete(route(`${basePath}.users.destroy`, id), {
            preserveScroll: true,
            onSuccess: () => {
                window.toast?.success?.("🗑️ User deleted.");
                // Inertia will re-render the page with fresh `users`,
                // so we don't *have* to manually reload.
            },
            onError: () => window.toast?.error?.("❌ Failed to delete user."),
        });
    };

    const roleStyles = {
        superadmin: {
            gradient: "from-purple-700 to-indigo-700",
            icon: "👑",
            label: "Super Admin",
            count: counts?.superadmin || 0,
        },
        admin: {
            gradient: "from-blue-700 to-sky-600",
            icon: "🧭",
            label: "Admin",
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
            icon: "👤",
            label: "User / Customers",
            count: counts?.user || 0,
        },
    };

    const roleColor = (role, isCustomer = false) =>
        isCustomer
            ? "bg-amber-500 role-badge"
            : {
                  superadmin: "bg-purple-600 role-badge",
                  admin: "bg-blue-600 role-badge",
                  staff: "bg-green-600 role-badge",
                  user: "bg-gray-600 role-badge",
              }[role] || "bg-gray-500 role-badge";

    const SortIcon = ({ field }) =>
        sortField === field ? (
            <span className="ml-1 text-xs">
                {sortDirection === "asc" ? "▲" : "▼"}
            </span>
        ) : null;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-white">
                    Manage Users ({role})
                </h2>
            }
        >
            <Head title="Manage Users" />

            <div className="py-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-white">
                        Manage Users ({role})
                    </h3>

                    {role === "superadmin" && (
                        <Link
                            href={route(`${basePath}.users.create`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            ➕ Add User
                        </Link>
                    )}
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Object.entries(roleStyles).map(
                        ([r, { gradient, icon, label, count }]) => (
                            <button
                                key={r}
                                onClick={() => handleFilter(r)}
                                className={`rounded-xl text-left p-5 transition transform bg-gradient-to-br ${gradient} shadow-md hover:scale-105 hover:shadow-lg text-white ${
                                    roleFilter === r
                                        ? "ring-4 ring-offset-2 ring-offset-gray-100 scale-105 shadow-xl animate-pulse"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-4xl">{icon}</span>
                                    <h2 className="text-3xl font-bold text-white">
                                        {count}
                                    </h2>
                                </div>
                                <p className="mt-2 text-sm uppercase font-semibold text-white">
                                    {label}
                                </p>
                            </button>
                        ),
                    )}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-3 mt-6">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border border-gray-400 bg-white dark:border-gray-600 dark:bg-gray-900 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
                    >
                        Search
                    </button>
                </form>

                {/* USERS TABLE */}
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
                                ].map((h, idx) => (
                                    <th
                                        key={h}
                                        onClick={() =>
                                            [
                                                "Name",
                                                "Email",
                                                "Phone",
                                                "Role",
                                                "Created",
                                            ].includes(h)
                                                ? handleSort(
                                                      h
                                                          .toLowerCase()
                                                          .replace(" ", "_"),
                                                  )
                                                : null
                                        }
                                        className={`px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white ${
                                            idx > 0 && idx < 6
                                                ? "cursor-pointer select-none"
                                                : ""
                                        }`}
                                    >
                                        {h}
                                        {idx > 0 && idx < 6 && (
                                            <SortIcon
                                                field={h
                                                    .toLowerCase()
                                                    .replace(" ", "_")}
                                            />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.length ? (
                                users.map((u, i) => {
                                    const isCustomer =
                                        u.role === "user" &&
                                        !u.email?.includes("@jlmc") &&
                                        !u.email?.includes("admin");

                                    const displayRole = isCustomer
                                        ? "Customer"
                                        : u.role.charAt(0).toUpperCase() +
                                          u.role.slice(1);

                                    return (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                        >
                                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-white">
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-2 text-sm font-medium flex items-center gap-2 text-gray-800 dark:text-white">
                                                <span>{u.name}</span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-white">
                                                {u.email || "—"}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-white">
                                                {u.phone || "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`role-badge px-3 py-1 rounded-full text-xs uppercase tracking-wide ${roleColor(
                                                        u.role,
                                                        isCustomer,
                                                    )}`}
                                                >
                                                    {displayRole}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-white">
                                                {new Date(
                                                    u.created_at,
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-2 flex flex-wrap gap-3 text-sm">
                                                {isCustomer ? (
                                                    <span className="text-gray-400 italic">
                                                        View Only
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={route(
                                                                `${basePath}.users.edit`,
                                                                u.id,
                                                            )}
                                                            className="text-blue-500 hover:text-blue-300 font-semibold"
                                                        >
                                                            Edit
                                                        </Link>

                                                        {role ===
                                                            "superadmin" && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleResend(
                                                                            u.id,
                                                                        )
                                                                    }
                                                                    className="text-yellow-400 hover:text-yellow-300 font-semibold"
                                                                >
                                                                    Resend Login
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            u.id,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-300 font-semibold"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
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
