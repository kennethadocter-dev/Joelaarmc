import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function AdminCustomersIndex() {
    const {
        auth,
        customers = [],
        pagination = {},
        flash = {},
        basePath = "admin",
        counts = {},
        filters = {},
    } = usePage().props;

    const isAdmin = (auth?.user?.role || "").toLowerCase() === "admin";
    const isSuperAdmin =
        (auth?.user?.role || "").toLowerCase() === "superadmin";

    /* ----------------------------
       FLASH MESSAGES
    ----------------------------- */
    useEffect(() => {
        if (flash?.success) window.toast?.success(flash.success);
        if (flash?.error) window.toast?.error(flash.error);
    }, [flash]);

    /* ----------------------------
       FILTERS
    ----------------------------- */
    const [search, setSearch] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState(
        filters.status ?? "active",
    );

    const applyFilter = (status = statusFilter, q = search) => {
        router.get(
            route(`${basePath}.customers.index`),
            { status, search: q },
            { replace: true, preserveScroll: true },
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilter(statusFilter, search);
    };

    /* ----------------------------
       DELETE MODAL
    ----------------------------- */
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmName, setConfirmName] = useState("");
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const openDeleteModal = (c) => {
        if (!isAdmin) return;
        setCustomerToDelete(c);
        setConfirmName("");
        setConfirmOpen(true);
    };

    const performDelete = () => {
        router.delete(
            route(`${basePath}.customers.destroy`, customerToDelete.id),
            {
                preserveScroll: true,
                data: { confirm_name: confirmName },
                onSuccess: () => {
                    window.toast?.success?.("Customer permanently deleted.");
                    setConfirmOpen(false);
                },
                onError: () => {
                    window.toast?.error?.("Failed to delete customer.");
                },
            },
        );
    };

    /* ----------------------------
       SUSPEND / REACTIVATE MODAL
    ----------------------------- */
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [customerToSuspend, setCustomerToSuspend] = useState(null);
    const [confirmSuspendName, setConfirmSuspendName] = useState("");

    const openSuspendModal = (c) => {
        if (!isAdmin) return;
        setCustomerToSuspend(c);
        setConfirmSuspendName("");
        setSuspendOpen(true);
    };

    const performSuspendToggle = () => {
        router.post(
            route(`${basePath}.customers.toggleSuspend`, customerToSuspend.id),
            {
                preserveScroll: true,
                data: { confirm_name: confirmSuspendName },
                onSuccess: () => {
                    window.toast?.success?.("Customer status updated.");
                    setSuspendOpen(false);
                },
                onError: () => {
                    window.toast?.error?.("Failed to update customer.");
                },
            },
        );
    };

    const hasActiveLoans = (c) =>
        (c?.loans || []).some(
            (loan) => loan.status === "active" || loan.status === "overdue",
        );

    const namesMatch = (input, target) =>
        input.trim().toLowerCase() === target.trim().toLowerCase();

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold">Customers</h2>}
        >
            <Head title="Customers" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* -------------------------------------
                   STATUS CARDS
                -------------------------------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        ["active", counts.active, "green"],
                        ["inactive", counts.inactive, "yellow"],
                        ["suspended", counts.suspended, "red"],
                        ["all", counts.total, "blue"],
                    ].map(([key, count, color]) => (
                        <div
                            key={key}
                            onClick={() => applyFilter(key)}
                            className={`cursor-pointer p-5 rounded-lg shadow border-l-4 bg-white ${
                                statusFilter === key
                                    ? `border-${color}-600 bg-${color}-50`
                                    : "border-gray-200"
                            }`}
                        >
                            <p className="text-sm text-gray-500 capitalize">
                                {key}
                            </p>
                            <p className="text-2xl font-bold">{count ?? 0}</p>
                        </div>
                    ))}
                </div>

                {/* -------------------------------------
                   SEARCH + ADD CUSTOMER
                -------------------------------------- */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex gap-2 w-full sm:w-auto"
                    >
                        <input
                            type="text"
                            value={search}
                            placeholder="Search customers..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full sm:w-80"
                        />
                        <button className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-lg">
                            Search
                        </button>
                    </form>

                    <Link
                        href={
                            isSuperAdmin
                                ? "#"
                                : route(`${basePath}.customers.create`)
                        }
                        onClick={(e) => isSuperAdmin && e.preventDefault()}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            isSuperAdmin
                                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    >
                        + Add Customer
                    </Link>
                </div>

                {/* -------------------------------------
                   TABLE
                -------------------------------------- */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 font-semibold text-gray-700">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Phone</th>
                                <th className="px-4 py-2">Community</th>
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
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2">
                                            {c.full_name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {c.phone ?? "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {c.community ?? "—"}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {c.loans?.length ?? 0}
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    c.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : c.status ===
                                                            "suspended"
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {c.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-3 flex-wrap">
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
                                                <Link
                                                    href={
                                                        isSuperAdmin
                                                            ? "#"
                                                            : route(
                                                                  `${basePath}.customers.edit`,
                                                                  c.id,
                                                              )
                                                    }
                                                    onClick={(e) =>
                                                        isSuperAdmin &&
                                                        e.preventDefault()
                                                    }
                                                    className={
                                                        isSuperAdmin
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-indigo-600 hover:underline"
                                                    }
                                                >
                                                    Edit
                                                </Link>

                                                {/* CREATE LOAN */}
                                                <Link
                                                    href={
                                                        isSuperAdmin ||
                                                        c.status === "suspended"
                                                            ? "#"
                                                            : route(
                                                                  `${basePath}.loans.create`,
                                                                  {
                                                                      customer_id:
                                                                          c.id,
                                                                      client_name:
                                                                          c.full_name,
                                                                  },
                                                              )
                                                    }
                                                    onClick={(e) => {
                                                        if (
                                                            isSuperAdmin ||
                                                            c.status ===
                                                                "suspended"
                                                        ) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    className={
                                                        isSuperAdmin ||
                                                        c.status === "suspended"
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-green-600 hover:underline"
                                                    }
                                                >
                                                    Create Loan
                                                </Link>

                                                {/* SUSPEND */}
                                                <span
                                                    onClick={() =>
                                                        isAdmin &&
                                                        openSuspendModal(c)
                                                    }
                                                    className={
                                                        isAdmin
                                                            ? c.status ===
                                                              "suspended"
                                                                ? "text-yellow-600 hover:underline cursor-pointer"
                                                                : "text-orange-600 hover:underline cursor-pointer"
                                                            : "text-gray-400 cursor-not-allowed"
                                                    }
                                                >
                                                    {c.status === "suspended"
                                                        ? "Reactivate"
                                                        : "Suspend"}
                                                </span>

                                                {/* DELETE */}
                                                <span
                                                    onClick={() =>
                                                        isAdmin &&
                                                        openDeleteModal(c)
                                                    }
                                                    className={
                                                        isAdmin
                                                            ? "text-red-600 hover:underline cursor-pointer"
                                                            : "text-gray-400 cursor-not-allowed"
                                                    }
                                                >
                                                    Delete
                                                </span>
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

                {/* -------------------------------------
                   PAGINATION
                -------------------------------------- */}
                {pagination?.links && (
                    <div className="flex justify-center mt-6 gap-2">
                        {pagination.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`px-3 py-1 rounded ${
                                    link.active
                                        ? "bg-blue-600 text-white"
                                        : link.url
                                          ? "bg-gray-200 hover:bg-gray-300"
                                          : "bg-gray-100 text-gray-400"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* -------------------------------------
               DELETE MODAL
            -------------------------------------- */}
            {isAdmin && confirmOpen && (
                <ModalOverlay>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-lg font-bold mb-3 text-red-700">
                            Permanent Delete
                        </h2>

                        <p className="mb-2">
                            Type exact name to confirm:
                            <br />
                            <strong>{customerToDelete?.full_name}</strong>
                        </p>

                        <input
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            className="w-full mb-4 p-2 border rounded"
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
                                    !namesMatch(
                                        confirmName,
                                        customerToDelete.full_name,
                                    )
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    !namesMatch(
                                        confirmName,
                                        customerToDelete.full_name,
                                    )
                                        ? "bg-red-400"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* -------------------------------------
               SUSPEND / REACTIVATE MODAL
            -------------------------------------- */}
            {isAdmin && suspendOpen && (
                <ModalOverlay>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-lg font-bold mb-3 text-orange-600">
                            {customerToSuspend?.status === "suspended"
                                ? "Reactivate Customer"
                                : "Suspend Customer"}
                        </h2>

                        {hasActiveLoans(customerToSuspend) &&
                            customerToSuspend.status !== "suspended" && (
                                <p className="text-red-600 mb-2">
                                    ⚠ This customer has active or overdue
                                    loans.
                                </p>
                            )}

                        <p className="mb-4">
                            Type exact name:
                            <br />
                            <strong>{customerToSuspend?.full_name}</strong>
                        </p>

                        <input
                            value={confirmSuspendName}
                            onChange={(e) =>
                                setConfirmSuspendName(e.target.value)
                            }
                            className="w-full mb-4 p-2 border rounded"
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
                                    !namesMatch(
                                        confirmSuspendName,
                                        customerToSuspend.full_name,
                                    )
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    !namesMatch(
                                        confirmSuspendName,
                                        customerToSuspend.full_name,
                                    )
                                        ? "bg-orange-300"
                                        : "bg-orange-600 hover:bg-orange-700"
                                }`}
                            >
                                {customerToSuspend?.status === "suspended"
                                    ? "Reactivate"
                                    : "Suspend"}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </AuthenticatedLayout>
    );
}

/* ----------------------------
   SIMPLE MODAL OVERLAY
----------------------------- */
function ModalOverlay({ children }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-24 z-[9999]">
            {children}
        </div>
    );
}
