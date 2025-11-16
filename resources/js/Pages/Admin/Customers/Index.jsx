import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";

export default function AdminCustomersIndex() {
    const {
        auth,
        customers = [],
        filters = {},
        flash = {},
        basePath = "admin",
        pagination = {},
    } = usePage().props;

    const confirm = useConfirm();

    // 🔍 instant search text
    const [search, setSearch] = useState("");

    const userRole = auth?.user?.role?.toLowerCase?.() || "";

    const canManage =
        ["admin", "staff", "superadmin"].includes(userRole) ||
        auth?.user?.is_super_admin;

    const canDelete =
        ["admin", "superadmin"].includes(userRole) ||
        auth?.user?.is_super_admin;

    /* Flash */
    useEffect(() => {
        if (flash?.success) window.toast?.success?.(flash.success);
        if (flash?.error) window.toast?.error?.(flash.error);
    }, [flash]);

    /* =====================================================
       🔥 INSTANT FILTERED LIST (no reload, no backend)
       ===================================================== */
    const filteredCustomers = useMemo(() => {
        if (!search) return customers;

        const term = search.toLowerCase();

        return customers.filter((c) =>
            [
                c.full_name?.toLowerCase(),
                c.phone?.toLowerCase(),
                c.community?.toLowerCase(),
                (c.loans?.length + "")?.toLowerCase(),
            ].some((v) => v?.includes(term)),
        );
    }, [search, customers]);

    /* Delete */
    const confirmDelete = (customer) => {
        confirm(
            "Confirm Deletion",
            `Are you sure you want to delete "${customer.full_name}"? This action cannot be undone.`,
            () => {
                router.delete(
                    route(`${basePath}.customers.destroy`, customer.id),
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            window.toast?.success?.(
                                "✅ Customer deleted successfully!",
                            ),
                        onError: () =>
                            window.toast?.error?.(
                                "❌ Failed to delete customer.",
                            ),
                    },
                );
            },
            "danger",
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Customers
                </h2>
            }
        >
            <Head title="Customers" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* 🔍 Instant search bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-80 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    {canManage && (
                        <Link
                            href={route(`${basePath}.customers.create`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            + Add Customer
                        </Link>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                <th className="px-4 py-2 text-left">
                                    Community
                                </th>
                                <th className="px-4 py-2 text-center">Loans</th>
                                <th className="px-4 py-2 text-center">
                                    Status
                                </th>
                                <th className="px-4 py-2 text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-t hover:bg-gray-50 transition text-sm"
                                    >
                                        <td className="px-4 py-2">
                                            {c.full_name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {c.phone || "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {c.community || "—"}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {c.loans?.length || 0}
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    c.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : c.status ===
                                                            "suspended"
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {c.status ?? "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-3 flex-wrap text-sm font-medium">
                                                <Link
                                                    href={route(
                                                        `${basePath}.customers.show`,
                                                        c.id,
                                                    )}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>

                                                {canManage && (
                                                    <Link
                                                        href={route(
                                                            `${basePath}.customers.edit`,
                                                            c.id,
                                                        )}
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}

                                                {canManage && (
                                                    <Link
                                                        href={route(
                                                            `${basePath}.loans.create`,
                                                            {
                                                                customer_id:
                                                                    c.id,
                                                                client_name:
                                                                    c.full_name,
                                                                amount_requested:
                                                                    c.loan_amount_requested,
                                                            },
                                                        )}
                                                        className="text-green-600 hover:underline"
                                                    >
                                                        Create Loan
                                                    </Link>
                                                )}

                                                {canDelete && (
                                                    <span
                                                        onClick={() =>
                                                            confirmDelete(c)
                                                        }
                                                        className="text-red-600 hover:underline cursor-pointer"
                                                    >
                                                        Delete
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-4 text-center text-gray-500"
                                    >
                                        No customers found.
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
