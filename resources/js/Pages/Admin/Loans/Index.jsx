import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function LoansIndex() {
    const {
        loans = [],
        summary = {},
        filters = {},
        auth = {},
        basePath = "admin",
        flash = {},
    } = usePage().props;

    const user = auth?.user || {};
    const [clientSearch, setClientSearch] = useState(filters.client || "");
    const [status, setStatus] = useState(filters.status || "");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route(`${basePath}.loans.index`),
                {
                    client: clientSearch || undefined,
                    status: status || undefined,
                },
                { preserveState: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delay);
    }, [clientSearch, status]);

    const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;
    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
              })
            : "—";
    const daysOverdue = (dueDate) => {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : null;
    };

    const canManage =
        ["admin", "staff", "officer", "superadmin"].includes(user?.role) ||
        user?.is_super_admin;

    const Card = ({ title, sub, count = 0, sum = 0, onView }) => (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-transform duration-200 w-64 p-5 flex flex-col gap-2 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">{title}</div>
            <div className="text-2xl font-bold text-gray-800">{count}</div>
            <div className="text-sm text-gray-600">
                {sub}: {money(sum)}
            </div>
            <button
                onClick={onView}
                className="mt-2 px-3 py-1.5 text-sm font-semibold rounded-md bg-gray-800 text-white hover:bg-black transition"
            >
                View All
            </button>
        </div>
    );

    const badge = (status) => {
        switch (status) {
            case "active":
                return "bg-blue-100 text-blue-700";
            case "paid":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "overdue":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    All Loans
                </h2>
            }
        >
            <Head title="All Loans" />
            <Toaster position="top-right" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* 💠 Summary Cards */}
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                    <div className="flex flex-nowrap space-x-6 min-w-max">
                        <Card
                            title="Active Loans"
                            sub="Total Amount"
                            count={summary?.active?.count || 0}
                            sum={summary?.active?.sum || 0}
                            onView={() => setStatus("active")}
                        />
                        <Card
                            title="Pending Loans"
                            sub="Total Amount"
                            count={summary?.pending?.count || 0}
                            sum={summary?.pending?.sum || 0}
                            onView={() => setStatus("pending")}
                        />
                        <Card
                            title="Paid Loans"
                            sub="Total Amount"
                            count={summary?.paid?.count || 0}
                            sum={summary?.paid?.sum || 0}
                            onView={() => setStatus("paid")}
                        />
                        <Card
                            title="Overdue Loans"
                            sub="Total Amount"
                            count={summary?.overdue?.count || 0}
                            sum={summary?.overdue?.sum || 0}
                            onView={() => setStatus("overdue")}
                        />
                    </div>
                </div>

                {/* 🔍 Filters + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800"
                        >
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Search by client name..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64 bg-white text-gray-800"
                        />

                        <button
                            onClick={() =>
                                router.reload({ only: ["loans", "summary"] })
                            }
                            className="px-4 py-2 text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition shadow"
                        >
                            Refresh
                        </button>

                        {(status || clientSearch) && (
                            <button
                                onClick={() => {
                                    setStatus("");
                                    setClientSearch("");
                                    router.get(
                                        route(`${basePath}.loans.index`),
                                        {},
                                        { replace: true },
                                    );
                                }}
                                className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-800 text-white hover:bg-black transition shadow"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {canManage && (
                        <Link
                            href={route(`${basePath}.customers.index`)}
                            className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 shadow transition"
                        >
                            + New Loan (Select Customer)
                        </Link>
                    )}
                </div>

                {/* 📋 Loans Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "ID",
                                    "Client Name",
                                    "Created By",
                                    "Amount",
                                    "Interest",
                                    "Term",
                                    "Start Date",
                                    "Due Date",
                                    "Status",
                                    "Remaining",
                                    "Actions",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-800"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loans.length ? (
                                loans.map((loan) => {
                                    const overdueDays = daysOverdue(
                                        loan.due_date,
                                    );
                                    return (
                                        <tr
                                            key={loan.id}
                                            className={`hover:bg-gray-100 transition-colors duration-150 ${
                                                loan.status === "overdue"
                                                    ? "bg-red-50"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                                #{loan.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {loan.client_name || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {loan.user?.name || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {money(loan.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {loan.interest_rate}%
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {loan.term_months}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {formatDate(loan.start_date)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {loan.due_date ? (
                                                    <>
                                                        {formatDate(
                                                            loan.due_date,
                                                        )}
                                                        {overdueDays && (
                                                            <span className="ml-1 text-xs text-red-600">
                                                                ({overdueDays}{" "}
                                                                days overdue)
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${badge(
                                                        loan.status,
                                                    )}`}
                                                >
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                                {money(
                                                    loan.amount_remaining ?? 0,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm flex flex-wrap gap-2">
                                                <Link
                                                    href={route(
                                                        `${basePath}.loans.show`,
                                                        loan.id,
                                                    )}
                                                    preserveScroll
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 transition"
                                                >
                                                    View Loan
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="11"
                                        className="text-center py-6 text-gray-600"
                                    >
                                        No loans found.
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
