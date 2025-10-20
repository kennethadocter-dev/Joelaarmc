import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { printSection } from "@/utils/printSection";
import Toast from "@/Components/Toast";
import ConfirmationModal from "@/Components/ConfirmationModal"; // ✅ New component

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
        filters = {},
        auth = {},
        basePath = "admin",
    } = usePage().props;

    const user = auth?.user || {};
    const [q, setQ] = useState(filters.q || "");
    const tableRef = useRef(null);
    const [toast, setToast] = useState({ message: "", type: "success" });

    // 🔹 Modal control
    const [modal, setModal] = useState({
        open: false,
        action: null,
        loanId: null,
    });

    const canManage =
        ["admin", "staff", "officer", "superadmin"].includes(user?.role) ||
        user?.is_super_admin;

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route(`${basePath}.reports.index`),
                { q: q || undefined },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 400);
        return () => clearTimeout(timeout);
    }, [q]);

    const handlePrint = () => {
        if (tableRef.current) {
            printSection(
                tableRef.current,
                "Loan Reports",
                "Joelaar Micro-Credit Services",
            );
        } else {
            setToast({
                message: "⚠️ Table section not found!",
                type: "error",
            });
        }
    };

    // 🔹 Trigger modal instead of confirm()
    const openModal = (action, loanId = null) => {
        setModal({ open: true, action, loanId });
    };

    // 🔹 Confirm modal action
    const confirmModalAction = () => {
        const { action, loanId } = modal;
        setModal({ open: false, action: null, loanId: null });

        if (action === "retry") {
            router.post(
                route(`${basePath}.reports.sendAgreement`, loanId),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        setToast({
                            message:
                                "✅ Loan Agreement email resent successfully!",
                            type: "success",
                        }),
                    onError: () =>
                        setToast({
                            message:
                                "❌ Failed to resend Loan Agreement email.",
                            type: "error",
                        }),
                },
            );
        } else if (action === "clear") {
            router.delete(route(`${basePath}.reports.clearFailures`), {
                preserveScroll: true,
                onSuccess: () =>
                    setToast({
                        message: "🧹 All email failures cleared successfully!",
                        type: "success",
                    }),
                onError: () =>
                    setToast({
                        message:
                            "❌ Failed to clear failures. Please try again.",
                        type: "error",
                    }),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Reports Dashboard
                </h2>
            }
        >
            <Head title="Reports" />

            {toast.message && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: "", type: "success" })}
                />
            )}

            {/* ✅ Custom confirmation modal */}
            <ConfirmationModal
                open={modal.open}
                title={
                    modal.action === "clear"
                        ? "Clear All Failures?"
                        : "Retry Sending Email?"
                }
                message={
                    modal.action === "clear"
                        ? "Are you sure you want to clear all email failure logs?"
                        : "Are you sure you want to retry sending this Loan Agreement email?"
                }
                onConfirm={confirmModalAction}
                onCancel={() =>
                    setModal({ open: false, action: null, loanId: null })
                }
            />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 🔎 Search + Print */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                    <div className="font-semibold text-gray-800 text-lg">
                        All Loans
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by client name or loan ID…"
                            className="border border-gray-300 rounded px-3 py-2 w-full md:w-80 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black transition shadow"
                        >
                            🖨️ Print Report
                        </button>
                    </div>
                </div>

                {/* ⚠️ Recent Email Failures */}
                {failures && failures.length > 0 && (
                    <div className="bg-red-50 border border-red-300 p-4 rounded-lg shadow-md">
                        <h3 className="text-red-700 font-bold text-sm mb-2">
                            ⚠️ Recent Email Failures
                        </h3>

                        <ul className="divide-y divide-red-200 mb-3">
                            {failures.map((f) => (
                                <li
                                    key={f.id}
                                    className="py-2 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-red-700"
                                >
                                    <div className="space-y-1 md:space-y-0">
                                        <div>
                                            Failed to send <b>{f.subject}</b> to{" "}
                                            <b>{f.recipient}</b>
                                        </div>
                                        <div className="text-xs text-red-500 truncate">
                                            Reason: {f.error_message}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(
                                                f.failed_at,
                                            ).toLocaleString()}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            openModal("retry", f.loan_id)
                                        }
                                        className="mt-2 md:mt-0 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-semibold shadow-sm transition"
                                    >
                                        🔁 Retry Send
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* 🧹 Clear All Failures */}
                        <button
                            onClick={() => openModal("clear")}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold shadow-sm transition"
                        >
                            🧹 Clear All Failures
                        </button>
                    </div>
                )}

                {/* 📊 Loan Table */}
                <div
                    ref={tableRef}
                    className="overflow-x-auto bg-white rounded-lg shadow"
                >
                    <h2 className="text-center text-lg font-bold my-4 bg-gray-800 text-white py-2 rounded-md shadow-sm">
                        Loan Reports
                    </h2>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 text-gray-800">
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

                        <tbody className="divide-y divide-gray-200">
                            {loans.length ? (
                                loans.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            #{loan.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {loan.client_name ||
                                                loan.customer?.full_name ||
                                                "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {money(loan.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {loan.interest_rate ?? 0}%
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {loan.term_months ?? 0} months
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {fmt(loan.start_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {fmt(loan.due_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm capitalize">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    loan.status === "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : loan.status ===
                                                            "pending"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : loan.status ===
                                                              "overdue"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm flex flex-wrap gap-2">
                                            <Link
                                                href={route(
                                                    `${basePath}.reports.show`,
                                                    loan.id,
                                                )}
                                                className="text-blue-600 hover:underline"
                                            >
                                                View Full Report
                                            </Link>

                                            {canManage && (
                                                <Link
                                                    href={route(
                                                        `${basePath}.reports.sendAgreement`,
                                                        loan.id,
                                                    )}
                                                    method="post"
                                                    as="button"
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
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
