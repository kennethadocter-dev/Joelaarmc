import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function LoanShow() {
    const {
        loan = {},
        loanSchedules = [],
        auth = {},
        basePath = "admin",
        flash = {},
    } = usePage().props;

    const user = auth?.user || {};

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;
    const formatDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
              })
            : "—";

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

    /** 💳 Pay with Paystack (next unpaid schedule) */
    const handlePaystackPayment = async () => {
        const nextSchedule = loanSchedules.find((s) => !s.is_paid);
        const scheduleAmount = nextSchedule
            ? nextSchedule.amount_left || nextSchedule.amount
            : 0;

        if (!nextSchedule)
            return toast.error("All installments are already paid!");
        if (!scheduleAmount || scheduleAmount <= 0)
            return toast.error("No unpaid installment found!");

        toast.loading(
            `🔗 Initializing Paystack for ₵${Number(scheduleAmount).toFixed(2)}...`,
        );

        try {
            const response = await fetch(
                route(`${basePath}.paystack.initialize`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({
                        email: loan.customer?.email || "noemail@example.com",
                        amount: scheduleAmount,
                        loan_id: loan.id,
                        method: "paystack",
                    }),
                },
            );

            const data = await response.json();
            toast.dismiss();

            if (data?.data?.authorization_url || data?.redirect_url) {
                toast.success("✅ Redirecting to Paystack...");
                window.location.href =
                    data.data?.authorization_url || data.redirect_url;
            } else {
                toast.error("⚠️ Failed to initialize Paystack.");
                console.error("Paystack response:", data);
            }
        } catch (err) {
            toast.dismiss();
            toast.error("❌ Connection error. Please try again.");
            console.error(err);
        }
    };

    const actualPayments = [...(loan.payments || [])].sort(
        (a, b) => b.id - a.id,
    );
    const isFullyPaid = (loan.amount_remaining ?? 0) <= 0;

    // ✅ Derived values
    const totalWithInterest =
        loan.total_with_interest ??
        loan.total_due ??
        loan.amount + loan.interest_earned;
    const progress =
        totalWithInterest > 0
            ? Math.min(((loan.amount_paid ?? 0) / totalWithInterest) * 100, 100)
            : 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Loan Details
                </h2>
            }
        >
            <Head title={`Loan #${loan.id}`} />
            <Toaster position="top-right" />

            <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex justify-between items-center">
                    <Link
                        href={route(`${basePath}.loans.index`)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-black transition"
                    >
                        ← Back to Loans
                    </Link>
                </div>

                {/* ===================== SUMMARY CARD ===================== */}
                <div className="bg-white rounded-xl shadow border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Client Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Client Info
                        </h3>
                        <p>
                            <strong>Name:</strong> {loan.client_name}
                        </p>
                        <p>
                            <strong>Loan ID:</strong> #{loan.id}
                        </p>
                        <p>
                            <strong>Created By:</strong>{" "}
                            {loan.user?.name || "—"}
                        </p>
                    </div>

                    {/* Loan Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Loan Details
                        </h3>
                        <p>
                            <strong>Principal:</strong> {money(loan.amount)}
                        </p>
                        <p>
                            <strong>Interest Rate:</strong> {loan.interest_rate}
                            %
                        </p>
                        <p>
                            <strong>Interest Earned:</strong>{" "}
                            {money(loan.interest_earned)}
                        </p>
                        <p>
                            <strong>Total w/ Interest:</strong>{" "}
                            {money(totalWithInterest)}
                        </p>
                        <p>
                            <strong>Term:</strong> {loan.term_months} months
                        </p>
                        <p>
                            <strong>Start:</strong>{" "}
                            {formatDate(loan.start_date)}
                        </p>
                        <p>
                            <strong>Due:</strong> {formatDate(loan.due_date)}
                        </p>
                    </div>

                    {/* Balance Summary */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Balance Summary
                        </h3>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${badge(loan.status)}`}
                            >
                                {loan.status}
                            </span>
                        </p>
                        <p>
                            <strong>Paid:</strong>{" "}
                            {money(loan.amount_paid ?? 0)}
                        </p>
                        <p>
                            <strong>Remaining:</strong>{" "}
                            <span className="text-red-600 font-semibold">
                                {money(loan.amount_remaining ?? 0)}
                            </span>
                        </p>

                        {/* ✅ Progress bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                <span>Progress</span>
                                <span>{progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${
                                        isFullyPaid
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Paid badge */}
                {isFullyPaid && (
                    <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-lg font-semibold">
                        🎉 This loan is fully paid.
                    </div>
                )}

                {/* ===================== ACTION BUTTONS ===================== */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/${basePath}/payments/create?loan_id=${loan.id}&redirect=${encodeURIComponent(
                            `/${basePath}/loans/${loan.id}`,
                        )}`}
                        disabled={isFullyPaid}
                        className={`inline-flex items-center justify-center px-5 py-2 rounded-md font-semibold transition ${
                            isFullyPaid
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    >
                        💵 Record Cash Payment
                    </Link>

                    <button
                        onClick={handlePaystackPayment}
                        disabled={isFullyPaid}
                        className={`px-5 py-2 rounded-md font-semibold transition ${
                            isFullyPaid
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        💳 Pay with Paystack
                    </button>
                </div>

                {/* ===================== PAYMENT SCHEDULE TABLE ===================== */}
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-gray-800 px-6 py-3 border-b">
                        Payment Schedule
                    </h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "#",
                                    "Month",
                                    "Due Date",
                                    "Expected Amount",
                                    "Paid",
                                    "Remaining",
                                    "Status",
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
                            {loanSchedules.length ? (
                                loanSchedules.map((s, i) => (
                                    <tr
                                        key={s.id || i}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            Month {s.payment_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDate(s.due_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {money(s.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-green-700 font-semibold">
                                            {money(s.amount_paid || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600 font-semibold">
                                            {money(s.amount_left || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    s.is_paid
                                                        ? "bg-green-100 text-green-700"
                                                        : s.amount_paid > 0
                                                          ? "bg-yellow-100 text-yellow-700"
                                                          : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {s.is_paid
                                                    ? "Paid"
                                                    : s.amount_paid > 0
                                                      ? "Partial"
                                                      : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-6 text-gray-600"
                                    >
                                        No payment schedule available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ===================== PAYMENT HISTORY TABLE ===================== */}
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-gray-800 px-6 py-3 border-b">
                        Payment History
                    </h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "#",
                                    "Payment ID",
                                    "Amount",
                                    "Received By",
                                    "Method",
                                    "Date",
                                    "Note",
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
                            {actualPayments.length ? (
                                <>
                                    {actualPayments.map((p, i) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                #{p.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {money(p.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {p.received_by_user?.name ||
                                                    p.received_by ||
                                                    "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                                                {p.payment_method || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {formatDate(p.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {p.note || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-100 font-semibold">
                                        <td
                                            colSpan="2"
                                            className="px-4 py-3 text-right"
                                        >
                                            Total:
                                        </td>
                                        <td className="px-4 py-3 text-green-700">
                                            {money(
                                                actualPayments.reduce(
                                                    (sum, p) =>
                                                        sum +
                                                        Number(p.amount || 0),
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td colSpan="4"></td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-6 text-gray-600"
                                    >
                                        No payments recorded yet.
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
