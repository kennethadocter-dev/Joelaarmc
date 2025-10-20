import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { useState } from "react";

/* 🔹 Helpers */
const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;
const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "—";

export default function CustomerLoans() {
    const {
        customer,
        loans = [],
        auth = {},
        flash = {},
        basePath = "admin",
    } = usePage().props;

    const canRecordPayment =
        ["admin", "staff", "superadmin"].includes(auth?.user?.role) ||
        auth?.is_super_admin;

    const [selectedLoan, setSelectedLoan] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        amount: "",
        paid_at: new Date().toISOString().split("T")[0],
        reference: "",
        note: "",
    });

    const submitPayment = (e) => {
        e.preventDefault();
        if (!selectedLoan) return;

        post(route(`${basePath}.loans.payment`, selectedLoan.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setModalOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Loans for {customer.full_name}
                </h2>
            }
        >
            <Head title={`Loans for ${customer.full_name}`} />

            <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

                {/* 🔙 Back + Create */}
                <div className="flex justify-between items-center">
                    <Link
                        href={route(`${basePath}.loans.index`)}
                        className="text-gray-600 hover:underline"
                    >
                        ← Back to All Loans
                    </Link>

                    <Link
                        href={route(`${basePath}.loans.create`, {
                            client_name: customer.full_name,
                            customer_id: customer.id,
                        })}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
                    >
                        + Create New Loan for {customer.full_name}
                    </Link>
                </div>

                {/* 📊 Customer Loans Table */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Loan History ({loans.length})
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 text-gray-800">
                                <tr>
                                    {[
                                        "Loan ID",
                                        "Amount",
                                        "Interest",
                                        "Start Date",
                                        "Due Date",
                                        "Status",
                                        "Remaining",
                                        "Actions",
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-4 py-2 text-left text-sm font-semibold"
                                        >
                                            {col}
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
                                            <td className="px-4 py-2 text-sm">
                                                #{loan.id}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {money(loan.amount)}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {loan.interest_rate}%
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {formatDate(loan.start_date)}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {formatDate(loan.due_date)}
                                            </td>
                                            <td className="px-4 py-2 text-sm capitalize">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        loan.status === "active"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : loan.status ===
                                                                "paid"
                                                              ? "bg-green-100 text-green-700"
                                                              : loan.status ===
                                                                  "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {money(loan.amount_remaining)}
                                            </td>
                                            <td className="px-4 py-2 text-sm flex gap-2">
                                                <Link
                                                    href={route(
                                                        `${basePath}.loans.show`,
                                                        loan.id,
                                                    )}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                {canRecordPayment &&
                                                    loan.status ===
                                                        "active" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoan(
                                                                    loan,
                                                                );
                                                                setModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            Record Payment
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-6 text-gray-600"
                                        >
                                            No loans found for this customer.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 💳 Record Payment Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Record Payment for Loan #{selectedLoan?.id}
                        </h3>

                        <form onSubmit={submitPayment} className="space-y-4">
                            <Field
                                label="Amount (₵)"
                                type="number"
                                value={data.amount}
                                onChange={(e) =>
                                    setData("amount", e.target.value)
                                }
                                required
                            />
                            <Field
                                label="Payment Date"
                                type="date"
                                value={data.paid_at}
                                onChange={(e) =>
                                    setData("paid_at", e.target.value)
                                }
                                required
                            />
                            <Field
                                label="Reference (optional)"
                                type="text"
                                value={data.reference}
                                onChange={(e) =>
                                    setData("reference", e.target.value)
                                }
                                placeholder="Txn ID or receipt number"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Note (optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.note}
                                    onChange={(e) =>
                                        setData("note", e.target.value)
                                    }
                                    className="mt-1 block w-full border rounded-md p-2 text-gray-800"
                                    placeholder="Any additional info about this payment…"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Save Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

/* 🔸 Reusable Field Component */
function Field({ label, type = "text", value, onChange, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="mt-1 block w-full border rounded-md p-2 text-gray-800 bg-white"
            />
        </div>
    );
}
