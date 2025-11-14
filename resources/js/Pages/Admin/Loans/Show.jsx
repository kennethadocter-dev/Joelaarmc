import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function LoanShow() {
    const {
        loan = {},
        loanSchedules = [],
        basePath = "admin",
        flash = {},
    } = usePage().props;

    const [showCashModal, setShowCashModal] = useState(false);
    const [cashAmount, setCashAmount] = useState("");
    const [cashNote, setCashNote] = useState("");

    /* ✅ Flash toast messages */
    useEffect(() => {
        if (flash?.success) window.toast?.success?.(flash.success);
        if (flash?.error) window.toast?.error?.(flash.error);
    }, [flash]);

    // ✅ Helpers
    const safeNum = (n) => (isNaN(parseFloat(n)) ? 0 : parseFloat(n));
    const money = (n) => `₵${safeNum(n).toFixed(2)}`;
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
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ✅ Use schedules if available
    const schedules =
        loan.loan_schedules?.length > 0
            ? loan.loan_schedules
            : (loanSchedules ?? []);

    // ✅ Calculate totals safely
    const totalWithInterest = schedules.length
        ? schedules.reduce((sum, s) => sum + safeNum(s.amount), 0)
        : safeNum(loan.total_with_interest) ||
          safeNum(loan.total_due) ||
          safeNum(loan.amount) + safeNum(loan.interest_earned);

    const amountPaid = schedules.length
        ? schedules.reduce((sum, s) => sum + safeNum(s.amount_paid), 0)
        : safeNum(loan.amount_paid);

    const remaining = schedules.length
        ? schedules.reduce((sum, s) => sum + safeNum(s.amount_left), 0)
        : safeNum(loan.amount_remaining);

    const months = safeNum(loan.term_months) || 1;
    const monthly = totalWithInterest / months;

    // ✅ Calculate interest based on ₵200 base logic
    const baseRates = {
        1: 240,
        2: 131 * 2,
        3: 95 * 3,
        4: 78 * 4,
        5: 67 * 5,
        6: 61 * 6,
    };
    let interestAmount = 0;
    if (months > 0 && baseRates[months]) {
        const scale = safeNum(loan.amount) / 200;
        const expectedTotal = baseRates[months] * scale;
        interestAmount = expectedTotal - safeNum(loan.amount);
    }

    const progress =
        totalWithInterest > 0
            ? Math.min((amountPaid / totalWithInterest) * 100, 100)
            : 0;

    const isFullyPaid = remaining <= 0.01;
    const displayStatus = isFullyPaid
        ? "paid"
        : loan.status === "pending"
          ? "pending"
          : "active";

    /** 💵 Cash modal handling */
    const openCashModal = () => {
        const nextSchedule = schedules.find((s) => !s.is_paid);
        if (!nextSchedule)
            return window.toast?.error?.("All installments are paid!");

        const remainingAmt =
            safeNum(nextSchedule.amount_left) > 0
                ? nextSchedule.amount_left
                : nextSchedule.amount;
        setCashAmount(remainingAmt);
        setCashNote(
            `Installment #${nextSchedule.payment_number} due ${formatDate(
                nextSchedule.due_date,
            )}`,
        );
        setShowCashModal(true);
    };

    /** 💾 Submit payment */
    const submitCashPayment = async () => {
        if (!cashAmount || safeNum(cashAmount) <= 0)
            return window.toast?.error?.("Enter a valid amount.");

        const loading = window.toast?.loading?.("Recording cash payment...");
        try {
            const res = await fetch(
                route(`${basePath}.loans.recordPayment`, loan.id),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({
                        amount: cashAmount,
                        note: cashNote,
                    }),
                },
            );

            window.toast?.dismiss?.(loading);

            if (res.ok) {
                window.toast?.success?.("✅ Cash payment recorded!");
                router.reload();
                setShowCashModal(false);
                setCashAmount("");
                setCashNote("");
            } else {
                window.toast?.error?.("Failed to record payment.");
            }
        } catch (e) {
            window.toast?.dismiss?.(loading);
            window.toast?.error?.("Error recording payment.");
            console.error(e);
        }
    };

    const payWithPaystack = () =>
        window.toast?.info?.(
            "💳 Paystack integration is temporarily disabled.",
        );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Loan Details
                </h2>
            }
        >
            <Head title={`Loan #${loan.id}`} />

            <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* 🧾 Summary */}
                <div className="bg-white rounded-xl shadow border p-8 space-y-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <InfoBlock
                            title="Client Information"
                            items={[
                                ["Name", loan.client_name],
                                ["Loan ID", `#${loan.id}`],
                                ["Created By", loan.user?.name || "—"],
                                [
                                    "Status",
                                    <span
                                        key="status"
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${badge(
                                            displayStatus,
                                        )}`}
                                    >
                                        {displayStatus.toUpperCase()}
                                    </span>,
                                ],
                            ]}
                        />
                        <InfoBlock
                            title="Loan Details"
                            items={[
                                ["Principal", money(loan.amount)],
                                isFullyPaid
                                    ? [
                                          "Interest Earned",
                                          <span
                                              key="earned"
                                              className="font-semibold text-green-700"
                                          >
                                              {money(loan.interest_earned || 0)}
                                          </span>,
                                      ]
                                    : [
                                          "Expected Interest",
                                          <span
                                              key="expected"
                                              className="font-semibold text-blue-700"
                                          >
                                              {money(
                                                  loan.expected_interest ||
                                                      interestAmount,
                                              )}
                                          </span>,
                                      ],
                                ["Term", `${months} month(s)`],
                                ["Start Date", formatDate(loan.start_date)],
                                ["Due Date", formatDate(loan.due_date)],
                            ]}
                        />
                        <InfoBlock
                            title="Repayment Summary"
                            items={[
                                ["Total to Repay", money(totalWithInterest)],
                                ["Monthly Payment", money(monthly)],
                                ["Paid", money(amountPaid)],
                                [
                                    "Remaining",
                                    <span
                                        key="rem"
                                        className={`font-semibold ${
                                            isFullyPaid
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {money(remaining)}
                                    </span>,
                                ],
                            ]}
                        />
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                            <span>Progress</span>
                            <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full ${
                                    isFullyPaid ? "bg-green-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                {!isFullyPaid && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={openCashModal}
                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md"
                        >
                            💵 Record Cash Payment
                        </button>
                        <button
                            onClick={payWithPaystack}
                            disabled
                            title="Paystack integration disabled"
                            className="px-5 py-2 bg-gray-300 text-gray-600 font-semibold rounded-md cursor-not-allowed"
                        >
                            💳 Pay with Paystack (Disabled)
                        </button>
                    </div>
                )}

                {/* ✅ Payment Schedule */}
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
                                    "Amount",
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
                            {schedules.length ? (
                                schedules.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            Month {s.payment_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {formatDate(s.due_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {money(s.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {money(s.amount_paid)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {money(s.amount_left)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {s.is_paid ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    ✅ Paid
                                                </span>
                                            ) : safeNum(s.amount_paid) > 0 ? (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    ⏳ Partial
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    🔹 Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-6 text-gray-600"
                                    >
                                        No schedule available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Payment History */}
                <DataTable
                    title="Payment History"
                    headers={[
                        "#",
                        "Payment ID",
                        "Amount",
                        "Received By",
                        "Method",
                        "Date",
                        "Note",
                    ]}
                    rows={
                        loan.payments?.map((p, i) => ({
                            cells: [
                                i + 1,
                                `#${p.id}`,
                                money(p.amount),
                                p.received_by_user?.name || "—",
                                p.payment_method || "—",
                                formatDate(p.created_at),
                                p.note || "—",
                            ],
                        })) ?? []
                    }
                />
            </div>

            {/* 💵 Modal */}
            {showCashModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Record Cash Payment
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="number"
                                placeholder="Amount"
                                className="w-full border rounded-md px-3 py-2"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                            />
                            <textarea
                                placeholder="Note (optional)"
                                className="w-full border rounded-md px-3 py-2"
                                value={cashNote}
                                onChange={(e) => setCashNote(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setShowCashModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitCashPayment}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

/* InfoBlock */
function InfoBlock({ title, items }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {title}
            </h3>
            <div className="space-y-1 text-gray-700 text-sm">
                {items.map(([label, value], i) => (
                    <p key={i}>
                        <strong>{label}:</strong> {value}
                    </p>
                ))}
            </div>
        </div>
    );
}

/* DataTable */
function DataTable({ title, headers, rows }) {
    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto mt-6">
            <h3 className="text-lg font-semibold text-gray-800 px-6 py-3 border-b">
                {title}
            </h3>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        {headers.map((h) => (
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
                    {rows.length ? (
                        rows.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition">
                                {r.cells.map((c, j) => (
                                    <td key={j} className="px-4 py-3 text-sm">
                                        {c}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="text-center py-6 text-gray-600"
                            >
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
