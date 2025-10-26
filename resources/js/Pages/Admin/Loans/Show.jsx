import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

/* -------------------- 📊 Helpers -------------------- */
const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;
const longDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

/* 🌈 Add fade animation styles globally */
const style = document.createElement("style");
style.textContent = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10%, 80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
.animate-fade-in-out {
  animation: fadeInOut 3s ease-in-out forwards;
}
`;
document.head.appendChild(style);

export default function LoanShow() {
    const {
        loan: initialLoan = {},
        auth = {},
        flash = {},
        csrf_token,
        basePath = "admin",
    } = usePage().props;

    if (!initialLoan || Object.keys(initialLoan).length === 0) {
        return (
            <div className="text-center py-20 text-red-600 font-semibold">
                ⚠️ Loan not found or data not loaded.
            </div>
        );
    }

    const [loan, setLoan] = useState(initialLoan);
    const [open, setOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const canRecordPayment = ["admin", "staff", "superadmin"].includes(
        auth?.user?.role,
    );

    /* -------------------- 💳 Record Payment -------------------- */
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: "",
        paid_at: new Date().toISOString().split("T")[0],
        reference: "",
        note: "",
    });

    const submitPayment = (e) => {
        e.preventDefault();
        const payment = parseFloat(data.amount);
        const remaining = parseFloat(loan.amount_remaining || 0);

        if (payment > remaining) {
            alert(`⚠️ Payment exceeds remaining balance (${money(remaining)})`);
            return;
        }

        post(route(`${basePath}.loans.payment`, loan.id), {
            data,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
                router.reload({ only: ["loan"] });
            },
        });
    };

    /* 🕒 Hide flash after a few seconds */
    useEffect(() => {
        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => {
                window.history.replaceState(null, "", window.location.pathname);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    /* -------------------- 🔓 Activate / Delete -------------------- */
    const { delete: destroy } = useForm({});

    const handleActivate = () => {
        setConfirmAction({
            title: "Activate Loan",
            message:
                "Are you sure you want to activate this loan? Once activated, it becomes live and visible to the customer.",
            confirmLabel: "Activate",
            confirmTheme: "green",
            onConfirm: () => {
                post(route(`${basePath}.loans.activate`, loan.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ["loan"] });
                        setTimeout(() => window.location.reload(), 800);
                    },
                });
            },
        });
    };

    const handleDelete = () => {
        setConfirmAction({
            title: "Delete Loan",
            message:
                "Do you really want to delete this loan? This action cannot be undone.",
            confirmLabel: "Delete",
            confirmTheme: "red",
            onConfirm: () => {
                destroy(route(`${basePath}.loans.deactivate`, loan.id), {
                    onSuccess: () =>
                        router.visit(route(`${basePath}.loans.index`)),
                });
            },
        });
    };

    /* -------------------- Render -------------------- */
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Loan Details
                </h2>
            }
        >
            <Head title={`Loan #${loan.id}`} />

            {/* 🌈 Floating Toasts */}
            {flash?.success && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in-out">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in-out">
                    {flash.error}
                </div>
            )}

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 🔙 Navigation + Actions */}
                <div className="flex justify-between items-center">
                    <Link
                        href={route(`${basePath}.loans.index`)}
                        className="text-gray-600 hover:underline"
                    >
                        ← Back to Loans
                    </Link>

                    {loan.status === "pending" && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleActivate}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                ✅ Activate
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                ❌ Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* 💵 Payment Section */}
                {loan.status === "active" && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-gray-800 mb-3">
                            Make a Payment
                        </h3>

                        {(() => {
                            const nextDue =
                                loan.loan_schedules?.find(
                                    (s) =>
                                        !s.is_paid &&
                                        Number(s.installment_balance ?? 0) > 0,
                                ) || null;
                            const remainder = nextDue
                                ? Number(nextDue.installment_balance || 0)
                                : 0;
                            const disabled = remainder <= 0.009;

                            return (
                                <div className="flex flex-wrap gap-4 items-center">
                                    {/* 💳 CARD / PAYSTACK PAYMENT */}
                                    <form
                                        method="POST"
                                        action={route(
                                            `${basePath}.paystack.initialize`,
                                        )}
                                        className="flex items-center gap-3"
                                    >
                                        <input
                                            type="hidden"
                                            name="_token"
                                            value={csrf_token}
                                        />
                                        <input
                                            type="hidden"
                                            name="email"
                                            value={
                                                loan.customer?.email ||
                                                "test@example.com"
                                            }
                                        />
                                        <input
                                            type="hidden"
                                            name="loan_id"
                                            value={loan.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="amount"
                                            value={remainder}
                                        />
                                        <select
                                            name="method"
                                            className="border rounded p-2 bg-white text-gray-800"
                                        >
                                            <option value="card">
                                                💳 Card
                                            </option>
                                            <option value="mobile_money">
                                                📱 Mobile Money
                                            </option>
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={disabled}
                                            className={`px-4 py-2 rounded text-white ${
                                                disabled
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-green-600 hover:bg-green-700"
                                            }`}
                                            title={
                                                disabled
                                                    ? "Nothing due in the current installment."
                                                    : undefined
                                            }
                                        >
                                            Pay {money(remainder)}
                                        </button>
                                    </form>

                                    {/* 💵 CASH PAYMENT */}
                                    {canRecordPayment && (
                                        <button
                                            onClick={() => {
                                                setData(
                                                    "amount",
                                                    remainder.toFixed(2),
                                                );
                                                setOpen(true);
                                            }}
                                            disabled={disabled}
                                            className={`px-4 py-2 rounded text-white ${
                                                disabled
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                            title={
                                                disabled
                                                    ? "Nothing due in the current installment."
                                                    : undefined
                                            }
                                        >
                                            💵 Record Cash Payment (
                                            {money(remainder)})
                                        </button>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* 📅 Monthly Payment Schedule */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Monthly Payment Schedule
                    </h3>
                    {loan.loan_schedules?.length ? (
                        <table className="min-w-full text-sm border border-gray-100">
                            <thead className="bg-gray-100">
                                <tr>
                                    {[
                                        "Payment",
                                        "Amount (₵)",
                                        "Amount Paid (₵)",
                                        "Remainder (₵)",
                                        "Due Date",
                                        "Status",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-2 text-left font-semibold text-gray-700"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loan.loan_schedules.map((s) => {
                                    let label = "Pending";
                                    let colorClass =
                                        "bg-yellow-100 text-yellow-700";

                                    if (
                                        s.is_paid ||
                                        s.installment_balance <= 0.009
                                    ) {
                                        label = "Cleared ✅";
                                        colorClass =
                                            "bg-green-100 text-green-700";
                                    } else if (
                                        s.installment_balance < s.amount &&
                                        s.installment_balance > 0.009
                                    ) {
                                        label = `Partial — ₵${s.installment_balance.toFixed(2)} left`;
                                        colorClass =
                                            "bg-orange-100 text-orange-700";
                                    }

                                    return (
                                        <tr
                                            key={s.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2">
                                                {s.payment_number}
                                                {["st", "nd", "rd"][
                                                    s.payment_number - 1
                                                ] || "th"}{" "}
                                                Payment
                                            </td>
                                            <td className="px-4 py-2 text-gray-800 font-semibold">
                                                {money(s.amount)}
                                            </td>
                                            <td className="px-4 py-2 text-blue-700 font-semibold">
                                                {money(s.amount_paid)}
                                            </td>
                                            <td className="px-4 py-2 text-red-600 font-semibold">
                                                {money(s.installment_balance)}
                                            </td>
                                            <td className="px-4 py-2">
                                                {longDate(s.due_date)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`${colorClass} px-2 py-1 rounded text-xs font-semibold whitespace-nowrap`}
                                                >
                                                    {label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-600 italic">
                            No schedule available yet.
                        </p>
                    )}
                </div>

                {/* Modals */}
                {open && (
                    <PaymentModal
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onCancel={() => setOpen(false)}
                        onSubmit={submitPayment}
                    />
                )}

                {confirmAction && (
                    <ConfirmModal
                        action={confirmAction}
                        onCancel={() => setConfirmAction(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* 🧱 Components */
function Info({ label, value }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg text-gray-800 font-medium">{value}</p>
        </div>
    );
}

function PaymentModal({ data, setData, processing, onCancel, onSubmit }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Record Cash Payment
                </h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Field
                        label="Amount (₵)"
                        type="number"
                        value={data.amount}
                        onChange={(e) => setData("amount", e.target.value)}
                        required
                    />
                    <Field
                        label="Payment Date"
                        type="date"
                        value={data.paid_at}
                        onChange={(e) => setData("paid_at", e.target.value)}
                        required
                    />
                    <Field
                        label="Reference (optional)"
                        type="text"
                        value={data.reference}
                        onChange={(e) => setData("reference", e.target.value)}
                        placeholder="Txn ID or receipt number"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Note (optional)
                        </label>
                        <textarea
                            rows="3"
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                            className="mt-1 w-full border rounded-md p-2 text-gray-800"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300"
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
    );
}

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
                className="mt-1 w-full border rounded-md p-2 text-gray-800 bg-white"
            />
        </div>
    );
}

function ConfirmModal({ action, onCancel }) {
    if (!action) return null;

    const theme =
        action.confirmTheme === "red"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                </h3>
                <p className="text-gray-700 mb-6">{action.message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            action.onConfirm?.();
                            onCancel();
                        }}
                        className={`px-4 py-2 rounded text-white font-semibold ${theme}`}
                    >
                        {action.confirmLabel || "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
