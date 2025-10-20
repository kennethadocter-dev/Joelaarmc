import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { printSection } from "@/utils/printSection";

export default function CustomersIndex() {
    const {
        customers = [],
        counts = {},
        filters = {},
        flash = {},
        auth = {},
        basePath = "admin",
    } = usePage().props;

    const user = auth?.user || {};
    const [q, setQ] = useState(filters?.q || "");
    const [status, setStatus] = useState(filters?.status || "all");
    const tableRef = useRef(null);

    // 🔄 Debounced search/filter
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route(`${basePath}.customers.index`),
                { q: q || undefined, status: status || undefined },
                { preserveState: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(timer);
    }, [q, status]);

    // 🧩 Toggle active/inactive
    const handleToggle = (id, currentStatus) => {
        const msg =
            currentStatus === "active"
                ? "Mark this customer as inactive?"
                : "Reactivate this customer?";
        if (confirm(msg)) {
            router.post(route(`${basePath}.customers.toggleStatus`, id));
        }
    };

    // 🧩 Suspend / Reactivate
    const handleSuspendOrReactivate = (id, currentStatus, hasUnpaidLoan) => {
        if (currentStatus === "suspended") {
            if (confirm("Reactivate this suspended customer?")) {
                router.post(route(`${basePath}.customers.toggleStatus`, id));
            }
        } else {
            if (hasUnpaidLoan) {
                alert("⚠️ Cannot suspend — customer has unpaid loans.");
                return;
            }
            if (confirm("Suspend this customer?")) {
                router.post(route(`${basePath}.customers.suspend`, id));
            }
        }
    };

    // 🖨️ Print
    const handlePrint = () => {
        if (!tableRef.current) return alert("⚠️ Nothing to print!");
        const company =
            auth?.user?.company_name || "Joelaar Micro-Credit Services";
        const now = new Date().toLocaleString();

        const printable = document.createElement("div");
        printable.innerHTML = `
          <div style="text-align:center;margin-bottom:20px;">
            <h2 style="margin:0;">${company}</h2>
            <p style="margin:4px 0;">Customer Records Report</p>
            <p style="margin:4px 0;font-size:12px;color:#555;">Generated on ${now}</p>
            <hr style="margin:10px 0;">
          </div>
          ${tableRef.current.innerHTML}
        `;
        printSection(printable);
    };

    // ✅ Role-based permissions
    const canManage =
        ["admin", "staff", "officer", "superadmin"].includes(user?.role) ||
        user?.is_super_admin;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Customers
                </h2>
            }
        >
            <Head title="Customers" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* ✅ Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded shadow">
                        {flash.error}
                    </div>
                )}

                {/* 🧮 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Active",
                            key: "active",
                            count: counts.active ?? 0,
                        },
                        {
                            label: "Inactive",
                            key: "inactive",
                            count: counts.inactive ?? 0,
                        },
                        {
                            label: "Suspended",
                            key: "suspended",
                            count: counts.suspended ?? 0,
                        },
                        {
                            label: "Total",
                            key: "all",
                            count: counts.total ?? 0,
                        },
                    ].map(({ label, key, count }) => (
                        <div
                            key={key}
                            onClick={() => setStatus(key)}
                            className={`stat-card cursor-pointer p-5 rounded-xl text-center font-medium shadow-md transition transform hover:scale-[1.03]
                                bg-gray-800 ${
                                    status === key
                                        ? "ring-2 ring-offset-2 ring-green-400"
                                        : ""
                                }`}
                        >
                            <p className="text-sm font-semibold text-white">
                                {label}
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {count}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 🔍 Filters + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search name / phone / community…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 w-full md:w-80 bg-white text-gray-900 placeholder-gray-500"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 w-48 bg-white text-gray-900"
                        >
                            <option value="all">All Customers</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        {canManage && (
                            <Link
                                href={route(`${basePath}.customers.create`)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition shadow"
                            >
                                + New Customer
                            </Link>
                        )}
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black transition shadow"
                        >
                            🖨️ Print
                        </button>
                    </div>
                </div>

                {/* 📋 Customers Table */}
                <div
                    ref={tableRef}
                    className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200"
                >
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "Name",
                                    "Phone",
                                    "Community",
                                    "Location",
                                    "Created",
                                    "Status",
                                    "Actions",
                                ].map((head) => (
                                    <th
                                        key={head}
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-800"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customers.length ? (
                                customers.map((c) => {
                                    const hasUnpaidLoan = c.loans?.some(
                                        (loan) =>
                                            loan.status !== "paid" &&
                                            loan.amount_remaining > 0,
                                    );
                                    return (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-4 py-3 text-sm">
                                                {c.full_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {c.phone || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {c.community || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {c.location || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(
                                                    c.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm capitalize">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                        c.status === "active"
                                                            ? "bg-green-100 text-green-700 border-green-400"
                                                            : c.status ===
                                                                "suspended"
                                                              ? "bg-red-100 text-red-700 border-red-400"
                                                              : "bg-gray-200 text-gray-800 border-gray-400"
                                                    }`}
                                                >
                                                    {c.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-sm flex flex-wrap gap-3 items-center">
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
                                                    <>
                                                        <Link
                                                            href={route(
                                                                `${basePath}.loans.create`,
                                                                {
                                                                    customer_id:
                                                                        c.id,
                                                                    client_name:
                                                                        c.full_name,
                                                                },
                                                            )}
                                                            className={`${
                                                                c.loans
                                                                    ?.length >=
                                                                3
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-green-600 hover:underline"
                                                            }`}
                                                            onClick={(e) => {
                                                                if (
                                                                    c.loans
                                                                        ?.length >=
                                                                    3
                                                                ) {
                                                                    e.preventDefault();
                                                                    alert(
                                                                        "⚠️ This customer already has 3 active or pending loans.",
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Create Loan
                                                        </Link>

                                                        <span
                                                            onClick={() =>
                                                                handleToggle(
                                                                    c.id,
                                                                    c.status,
                                                                )
                                                            }
                                                            className={`cursor-pointer ${
                                                                c.status ===
                                                                    "active" &&
                                                                c.loans?.some(
                                                                    (loan) =>
                                                                        loan.status !==
                                                                            "paid" &&
                                                                        loan.amount_remaining >
                                                                            0,
                                                                )
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-blue-600 hover:underline"
                                                            }`}
                                                        >
                                                            {c.status ===
                                                            "active"
                                                                ? "Mark Inactive"
                                                                : c.status ===
                                                                    "inactive"
                                                                  ? "Reactivate"
                                                                  : "—"}
                                                        </span>

                                                        <span
                                                            onClick={() =>
                                                                handleSuspendOrReactivate(
                                                                    c.id,
                                                                    c.status,
                                                                    hasUnpaidLoan,
                                                                )
                                                            }
                                                            className={`cursor-pointer ${
                                                                c.status ===
                                                                "suspended"
                                                                    ? "text-green-600 hover:underline"
                                                                    : hasUnpaidLoan
                                                                      ? "text-gray-400 cursor-not-allowed"
                                                                      : "text-red-600 hover:underline"
                                                            }`}
                                                        >
                                                            {c.status ===
                                                            "suspended"
                                                                ? "Reactivate"
                                                                : "Suspend"}
                                                        </span>
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
                                        className="text-center py-6 text-gray-600"
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
