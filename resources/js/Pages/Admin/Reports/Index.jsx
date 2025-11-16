import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef, useMemo } from "react";
import { printSection } from "@/utils/printSection";

// Simple fallback confirm
const useConfirm = () => {
    return (title, message, onConfirm) => {
        if (window.confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
    };
};

// Helpers
const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;
const fmt = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "—";

export default function ReportsIndex() {
    const {
        loans = [],
        failures = [],
        auth = {},
        basePath = "admin",
        flash = {},
    } = usePage().props;

    const user = auth?.user || {};
    const confirm = useConfirm();

    // 🟢 Instant search text
    const [q, setQ] = useState("");

    const tableRef = useRef(null);

    const canManage =
        ["admin", "staff", "officer", "superadmin"].includes(user?.role) ||
        user?.is_super_admin;

    // 🔔 Flash Notifications
    useEffect(() => {
        if (flash?.success) window.toast?.success?.(flash.success);
        if (flash?.error) window.toast?.error?.(flash.error);
    }, [flash]);

    /* ===========================================================
       🔥 INSTANT CLIENT-SIDE SEARCH — no router.get()
       =========================================================== */
    const filteredLoans = useMemo(() => {
        if (!q) return loans;

        const term = q.toLowerCase();

        return loans.filter((loan) => {
            return (
                loan.client_name?.toLowerCase().includes(term) ||
                (loan.id + "").includes(term) ||
                (loan.amount + "").includes(term) ||
                (loan.status + "").toLowerCase().includes(term)
            );
        });
    }, [q, loans]);

    // Print
    const handlePrint = () => {
        if (!tableRef.current)
            return window.toast?.error?.("⚠️ Nothing to print!");

        printSection(
            tableRef.current,
            "Loan Reports",
            "Joelaar Micro-Credit Services",
        );
    };

    // Retry email
    const handleRetry = (loanId) => {
        confirm(
            "Retry Sending Email?",
            "Resend this Loan Agreement email?",
            () => {
                router.post(
                    route(`${basePath}.reports.sendAgreement`, loanId),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            window.toast?.success?.("Email resent!"),
                        onError: () =>
                            window.toast?.error?.("Failed to resend email."),
                    },
                );
            },
        );
    };

    // Clear failures
    const handleClearFailures = () => {
        confirm(
            "Clear Email Failures?",
            "This will delete ALL logged failures.",
            () => {
                router.post(
                    route(`${basePath}.reports.clearEmailFailures`),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            window.toast?.success?.("Failures cleared."),
                        onError: () =>
                            window.toast?.error?.("Could not clear failures."),
                    },
                );
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Reports
                </h2>
            }
        >
            <Head title="Reports" />

            <div className="py-8 max-w-7xl mx-auto px-4 space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div className="font-semibold text-gray-800 text-lg">
                        All Loans
                    </div>

                    <div className="flex gap-3">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by client or loan ID…"
                            className="border rounded px-3 py-2 w-80"
                        />
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-gray-800 text-white rounded"
                        >
                            🖨️ Print
                        </button>
                    </div>
                </div>

                {/* Failures */}
                {failures?.length > 0 && (
                    <div className="bg-red-100 border p-4 rounded">
                        <h3 className="font-bold text-red-700 mb-2">
                            ⚠️ Recent Email Failures
                        </h3>

                        {failures.map((f) => (
                            <div key={f.id} className="mb-3 p-2 border-b">
                                <div>
                                    Failed to send <b>{f.subject}</b> to{" "}
                                    <b>{f.recipient}</b>
                                </div>
                                <small className="text-gray-600">
                                    {new Date(f.failed_at).toLocaleString()}
                                </small>

                                <button
                                    onClick={() => handleRetry(f.loan_id)}
                                    className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded"
                                >
                                    Retry
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleClearFailures}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Table */}
                <div
                    ref={tableRef}
                    className="bg-white rounded shadow overflow-x-auto"
                >
                    <h2 className="text-center text-lg font-bold my-4 bg-gray-800 text-white py-2 rounded">
                        Loan Reports
                    </h2>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "Loan #",
                                    "Client",
                                    "Amount",
                                    "Rate",
                                    "Term",
                                    "Start",
                                    "Due",
                                    "Status",
                                    "Actions",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-sm font-semibold"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredLoans.length ? (
                                filteredLoans.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            #{loan.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {loan.client_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {money(loan.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {loan.interest_rate}%
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {loan.term_months} months
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {fmt(loan.start_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {fmt(loan.due_date)}
                                        </td>

                                        <td className="px-4 py-3 text-sm capitalize">
                                            {loan.status}
                                        </td>

                                        <td className="px-4 py-3 text-sm flex gap-2">
                                            <Link
                                                href={route(
                                                    `${basePath}.reports.show`,
                                                    loan.id,
                                                )}
                                                className="text-blue-600 hover:underline"
                                            >
                                                View
                                            </Link>

                                            {canManage && (
                                                <Link
                                                    href={route(
                                                        `${basePath}.reports.sendAgreement`,
                                                        loan.id,
                                                    )}
                                                    method="post"
                                                    as="button"
                                                    className="px-3 py-1 bg-green-600 text-white rounded"
                                                >
                                                    Send Agreement
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="text-center py-6 text-gray-500"
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
