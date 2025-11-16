import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function AdminCustomersIndex() {
    const {
        auth,
        customers = [],
        flash = {},
        basePath = "admin",
        counts = {},
        filters = {},
    } = usePage().props;

    const userRole = auth?.user?.role?.toLowerCase?.() || "";

    const canManage =
        ["admin", "staff", "superadmin"].includes(userRole) ||
        auth?.user?.is_super_admin;

    const canDelete = userRole === "admin";
    const canSuspend = userRole === "admin";

    /* =============================
       FLASH
    ============================= */
    useEffect(() => {
        if (flash?.success) window.toast?.success(flash.success);
        if (flash?.error) window.toast?.error(flash.error);
    }, [flash]);

    /* =============================
       SEARCH + STATUS FILTER (server-side)
    ============================= */
    const [search, setSearch] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(
        filters.status || "active",
    );

    const applyFilter = (newStatus = statusFilter, newSearch = search) => {
        router.get(
            route(`${basePath}.customers.index`),
            {
                status: newStatus,
                search: newSearch,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilter(statusFilter, search);
    };

    const handleStatusClick = (status) => {
        setStatusFilter(status);
        applyFilter(status, search);
    };

    /* =============================
       DELETE MODAL
    ============================= */
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmName, setConfirmName] = useState("");
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const openDeleteModal = (customer) => {
        setCustomerToDelete(customer);
        setConfirmName("");
        setConfirmOpen(true);
    };

    const performDelete = () => {
        if (!customerToDelete) return;

        router.delete(
            route(`${basePath}.customers.destroy`, customerToDelete.id),
            {
                preserveScroll: true,
                preserveState: false,
                data: { confirm_name: confirmName },
                onSuccess: () => {
                    window.toast?.success("Customer permanently deleted.");
                    setConfirmOpen(false);
                },
                onError: () =>
                    window.toast?.error("Failed to delete customer."),
            },
        );
    };

    /* =============================
       SUSPEND / REACTIVATE MODAL
    ============================= */
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [customerToSuspend, setCustomerToSuspend] = useState(null);
    const [confirmSuspendName, setConfirmSuspendName] = useState("");

    const openSuspendModal = (customer) => {
        setCustomerToSuspend(customer);
        setConfirmSuspendName("");
        setSuspendOpen(true);
    };

    const performSuspendToggle = () => {
        if (!customerToSuspend) return;

        router.post(
            route(`${basePath}.customers.toggleSuspend`, {
                customer: customerToSuspend.id,
            }),
            {
                data: { confirm_name: confirmSuspendName },
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setSuspendOpen(false);
                    window.toast?.success("Customer status updated.");
                },
                onError: () =>
                    window.toast?.error("Failed to update customer status."),
            },
        );
    };

    const hasActiveLoans = (c) =>
        (c?.loans || []).some(
            (loan) => loan.status === "active" || loan.status === "overdue",
        );

    /* =============================
       CARD STYLE HELPER
    ============================= */
    const cardBase =
        "cursor-pointer bg-white shadow rounded-lg p-5 border-l-4 transition hover:shadow-md";

    const isActiveCard = (val) => statusFilter === val;

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
                {/* =============================
                    SUMMARY CARDS
                ============================= */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Active */}
                    <div
                        onClick={() => handleStatusClick("active")}
                        className={`${cardBase} ${
                            isActiveCard("active")
                                ? "border-green-600 bg-green-50"
                                : "border-gray-200"
                        }`}
                    >
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold">
                            {counts.active ?? 0}
                        </p>
                    </div>

                    {/* Inactive */}
                    <div
                        onClick={() => handleStatusClick("inactive")}
                        className={`${cardBase} ${
                            isActiveCard("inactive")
                                ? "border-yellow-600 bg-yellow-50"
                                : "border-gray-200"
                        }`}
                    >
                        <p className="text-sm text-gray-500">Inactive</p>
                        <p className="text-2xl font-bold">
                            {counts.inactive ?? 0}
                        </p>
                    </div>

                    {/* Suspended */}
                    <div
                        onClick={() => handleStatusClick("suspended")}
                        className={`${cardBase} ${
                            isActiveCard("suspended")
                                ? "border-red-600 bg-red-50"
                                : "border-gray-200"
                        }`}
                    >
                        <p className="text-sm text-gray-500">Suspended</p>
                        <p className="text-2xl font-bold">
                            {counts.suspended ?? 0}
                        </p>
                    </div>

                    {/* All Customers */}
                    <div
                        onClick={() => handleStatusClick("all")}
                        className={`${cardBase} ${
                            isActiveCard("all")
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200"
                        }`}
                    >
                        <p className="text-sm text-gray-500">All Customers</p>
                        <p className="text-2xl font-bold">
                            {counts.total ?? 0}
                        </p>
                    </div>
                </div>

                {/* =============================
                    SEARCH + ADD
                ============================= */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full sm:w-auto gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-80 focus:ring-2 focus:ring-blue-600 outline-none"
                        />

                        <button
                            type="submit"
                            className="
                                hidden sm:inline-block
                                bg-blue-600 
                                hover:bg-blue-700 
                                text-white 
                                !text-opacity-100
                                px-3 
                                py-2 
                                rounded-lg 
                                text-sm 
                                font-semibold
                                [color:white!important]
                            "
                        >
                            Search
                        </button>
                    </form>

                    {canManage && (
                        <Link
                            href={route(`${basePath}.customers.create`)}
                            className="
                                bg-green-600 
                                hover:bg-green-700 
                                text-white 
                                !text-opacity-100
                                px-4 
                                py-2 
                                rounded-lg 
                                text-sm 
                                font-semibold 
                                transition
                                [color:white!important]
                            "
                        >
                            + Add Customer
                        </Link>
                    )}
                </div>

                {/* =============================
                    TABLE
                ============================= */}
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
                            {customers.length ? (
                                customers.map((c) => (
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
                                                {c.status || "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-3 flex-wrap text-sm font-medium">
                                                {/* VIEW */}
                                                <Link
                                                    href={route(
                                                        `${basePath}.customers.show`,
                                                        c.id,
                                                    )}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>

                                                {/* EDIT */}
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

                                                {/* Create Loan: Admin + Staff */}
                                                {["admin", "staff"].includes(
                                                    userRole,
                                                ) && (
                                                    <Link
                                                        href={
                                                            c.status ===
                                                            "suspended"
                                                                ? "#"
                                                                : route(
                                                                      `${basePath}.loans.create`,
                                                                      {
                                                                          customer_id:
                                                                              c.id,
                                                                          client_name:
                                                                              c.full_name,
                                                                          amount_requested:
                                                                              c.loan_amount_requested,
                                                                      },
                                                                  )
                                                        }
                                                        className={`${
                                                            c.status ===
                                                            "suspended"
                                                                ? "text-gray-400 cursor-not-allowed"
                                                                : "text-green-600 hover:underline"
                                                        }`}
                                                        onClick={(e) => {
                                                            if (
                                                                c.status ===
                                                                "suspended"
                                                            ) {
                                                                e.preventDefault();
                                                                alert(
                                                                    "⚠️ Suspended customer cannot take loans.",
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Create Loan
                                                    </Link>
                                                )}

                                                {/* Suspend */}
                                                {canSuspend && (
                                                    <span
                                                        onClick={() =>
                                                            openSuspendModal(c)
                                                        }
                                                        className={`cursor-pointer ${
                                                            c.status ===
                                                            "suspended"
                                                                ? "text-yellow-600 hover:underline"
                                                                : "text-orange-600 hover:underline"
                                                        }`}
                                                    >
                                                        {c.status ===
                                                        "suspended"
                                                            ? "Reactivate"
                                                            : "Suspend"}
                                                    </span>
                                                )}

                                                {/* Delete */}
                                                {canDelete && (
                                                    <span
                                                        onClick={() =>
                                                            openDeleteModal(c)
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

            {/* =============================
                DELETE MODAL
            ============================= */}
            {confirmOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-[99999]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-lg font-bold mb-3 text-red-700">
                            Permanent Delete
                        </h2>

                        <p className="text-gray-700 mb-4">
                            This action cannot be undone.
                            <br />
                            Type exact name:
                            <br />
                            <strong>{customerToDelete?.full_name}</strong>
                        </p>

                        <input
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Type customer name..."
                            className="w-full mb-4 px-3 py-2 border rounded-lg"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={performDelete}
                                disabled={
                                    confirmName.trim().toLowerCase() !==
                                    customerToDelete?.full_name
                                        ?.trim()
                                        .toLowerCase()
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    confirmName.trim().toLowerCase() !==
                                    customerToDelete?.full_name
                                        ?.trim()
                                        .toLowerCase()
                                        ? "bg-red-400 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================
                SUSPEND MODAL
            ============================= */}
            {suspendOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-[99999]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-lg font-bold mb-3 text-orange-600">
                            {customerToSuspend?.status === "suspended"
                                ? "Reactivate Customer"
                                : "Suspend Customer"}
                        </h2>

                        {hasActiveLoans(customerToSuspend) &&
                            customerToSuspend?.status !== "suspended" && (
                                <p className="text-red-600 font-semibold mb-2">
                                    ⚠️ This customer has active or overdue
                                    loans.
                                </p>
                            )}

                        <p className="text-gray-700 mb-4">
                            Type customer name to confirm:
                            <br />
                            <strong>{customerToSuspend?.full_name}</strong>
                        </p>

                        <input
                            value={confirmSuspendName}
                            onChange={(e) =>
                                setConfirmSuspendName(e.target.value)
                            }
                            placeholder="Type customer name..."
                            className="w-full mb-4 px-3 py-2 border rounded-lg"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSuspendOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={performSuspendToggle}
                                disabled={
                                    confirmSuspendName.trim().toLowerCase() !==
                                    customerToSuspend?.full_name
                                        ?.trim()
                                        .toLowerCase()
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    confirmSuspendName.trim().toLowerCase() !==
                                    customerToSuspend?.full_name
                                        ?.trim()
                                        .toLowerCase()
                                        ? "bg-orange-300 cursor-not-allowed"
                                        : "bg-orange-600 hover:bg-orange-700"
                                }`}
                            >
                                {customerToSuspend?.status === "suspended"
                                    ? "Reactivate"
                                    : "Suspend"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
