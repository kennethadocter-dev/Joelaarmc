import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import html2pdf from "html2pdf.js";
import Toast from "@/Components/Toast"; // Notification Toast

// ❌ REMOVE THIS — IT BREAKS SUPERADMIN ROUTES
// import { route } from "ziggy-js";

// 💰 Currency formatter
const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;

// 📅 Date formatter
const fmt = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

// ⭐ Interest multiplier logic
function getEffectiveMultiplier(term, rate) {
    const base = rate / 100;
    const table = { 1: 1 + base, 2: 1.31, 3: 1.425, 4: 1.56, 5: 1.67, 6: 1.83 };
    return table[term] ?? 1 + base;
}

// ⭐ Build repayment schedule
function buildSchedule(amount, ratePct, term, startDate) {
    if (!amount || !ratePct || !term || !startDate) return [];
    const multiplier = getEffectiveMultiplier(term, ratePct);
    const totalWithInterest = amount * multiplier;
    const monthly = totalWithInterest / term;
    const schedule = [];
    for (let i = 1; i <= term; i++) {
        const due = new Date(startDate);
        due.setMonth(due.getMonth() + i);
        schedule.push({
            month: i,
            amount: Math.round(monthly),
            due_date: due.toISOString().split("T")[0],
        });
    }
    return schedule;
}

export default function ReportShow() {
    const {
        loan,
        guarantors = [],
        csrf_token,
        basePath = "admin",
        auth = {},
        settings,
        flash = {},
    } = usePage().props;

    const [toast, setToast] = useState({
        message: flash?.success || flash?.error || "",
        type: flash?.success ? "success" : flash?.error ? "error" : "success",
    });

    if (!loan) {
        return (
            <AuthenticatedLayout>
                <Head title="Loan Report" />
                <div className="p-10 text-center text-red-600 font-semibold">
                    ⚠️ Loan data could not be loaded.
                </div>
            </AuthenticatedLayout>
        );
    }

    const multiplier = getEffectiveMultiplier(
        loan.term_months,
        loan.interest_rate,
    );
    const totalWithInterest = loan.amount * multiplier;
    const monthlyPayment = totalWithInterest / (loan.term_months || 1);

    const schedule = useMemo(
        () =>
            buildSchedule(
                loan.amount,
                loan.interest_rate,
                loan.term_months,
                loan.start_date,
            ),
        [loan.amount, loan.interest_rate, loan.term_months, loan.start_date],
    );

    const today = new Date();
    const agreementLine = `THIS LOAN AGREEMENT is made at BOLGATANGA this ${today.getDate()}${getOrdinal(
        today.getDate(),
    )} day of ${today.toLocaleString("en-US", {
        month: "long",
    })} ${today.getFullYear()} between Joelaar Micro-Credit Services and ${
        loan.client_name
    } (Borrower).`;

    /** 🖨 Print document */
    const handlePrint = () => {
        const element = document.getElementById("agreement-wrapper");
        if (!element)
            return setToast({
                message: "⚠️ Agreement section not found!",
                type: "error",
            });

        const opt = {
            margin: 0.4,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
        };

        html2pdf().set(opt).from(element).save();
    };

    /** 💾 Download PDF file */
    const handleDownload = () => {
        const element = document.getElementById("agreement-wrapper");
        const opt = {
            margin: 0.4,
            filename: `Loan_Agreement_${loan.id}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
        };
        html2pdf().set(opt).from(element).save();
    };

    /** 🔄 Refresh data */
    const handleRefresh = () => {
        try {
            router.reload({ only: ["loan", "guarantors"] });
            setToast({
                message: "🔄 Loan data refreshed successfully.",
                type: "success",
            });
        } catch {
            setToast({
                message: "⚠️ Could not refresh loan data.",
                type: "error",
            });
        }
    };

    /** 📧 Send Loan Agreement Email */
    const handleSendEmail = () => {
        router.post(
            route(`${basePath}.reports.sendAgreement`, loan.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    setToast({
                        message: "📧 Loan Agreement email sent successfully!",
                        type: "success",
                    }),
                onError: () =>
                    setToast({
                        message: "⚠️ Failed to send Loan Agreement email.",
                        type: "error",
                    }),
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Loan Agreement
                </h2>
            }
        >
            <Head title={`Loan Report #${loan.id}`} />

            {toast.message && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: "", type: "success" })}
                />
            )}

            <div className="py-8 max-w-4xl mx-auto px-4 space-y-8">
                {/* Top Bar */}
                <div className="flex justify-between items-center no-print">
                    <Link
                        href={route(`${basePath}.reports.index`)}
                        className="text-gray-600 hover:underline"
                    >
                        ← Back to Reports
                    </Link>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition"
                        >
                            🖨 Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition shadow"
                        >
                            ⬇ Download
                        </button>
                        <button
                            onClick={handleSendEmail}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow"
                        >
                            📧 Send Email
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition shadow"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* AGREEMENT BODY */}
                <div
                    id="agreement-wrapper"
                    className="bg-white text-black p-6 rounded-lg shadow-md border border-gray-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-400 pb-3 mb-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="Joelaar Logo"
                                className="w-16 h-16 object-contain"
                                onError={(e) =>
                                    (e.target.style.display = "none")
                                }
                            />
                            <div>
                                <h1 className="text-xl font-bold uppercase tracking-wide text-gray-800">
                                    {settings?.company_name ||
                                        "Joelaar Micro-Credit Services"}
                                </h1>
                                <p className="text-sm text-gray-600 italic">
                                    Empowering Growth Responsibly
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-700">
                            <p>
                                <strong>Date:</strong> {fmt(today)}
                            </p>
                            <p>
                                <strong>Loan ID:</strong> #{loan.id}
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold underline">
                            LOAN AGREEMENT
                        </h2>
                        <p className="text-gray-600 mt-1 text-sm">
                            Between{" "}
                            <strong>
                                {settings?.company_name ||
                                    "Joelaar Micro-Credit Services"}
                            </strong>{" "}
                            and <strong>{loan.client_name}</strong>
                        </p>
                    </div>

                    {/* Clauses */}
                    <section>
                        <h3 className="font-semibold text-lg">
                            CLAUSE 1: PARTIES
                        </h3>
                        <p>{agreementLine}</p>
                    </section>

                    <section className="mt-6">
                        <h3 className="font-semibold text-lg">
                            CLAUSE 2: SUBJECT MATTER AND DURATION
                        </h3>
                        <p>
                            The loan of <strong>{money(loan.amount)}</strong> is
                            granted for <strong>{loan.term_months}</strong>{" "}
                            month(s), starting on{" "}
                            <strong>{fmt(loan.start_date)}</strong>.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h3 className="font-semibold text-lg">
                            CLAUSE 3: AMOUNT, INTEREST AND TOTAL PAYABLE
                        </h3>
                        <p>
                            Total payable:{" "}
                            <strong>{money(totalWithInterest)}</strong>. Monthly
                            installment:{" "}
                            <strong>{money(monthlyPayment)}</strong>.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h3 className="font-semibold text-lg">
                            CLAUSE 4: TERMS OF PAYMENT
                        </h3>
                        <p>Repayment schedule:</p>
                        <table className="min-w-full text-sm mt-3 border border-gray-400 rounded">
                            <thead className="bg-gray-100 text-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left border-b border-gray-300">
                                        Payment
                                    </th>
                                    <th className="px-4 py-2 text-left border-b border-gray-300">
                                        Amount
                                    </th>
                                    <th className="px-4 py-2 text-left border-b border-gray-300">
                                        Due Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((r) => (
                                    <tr
                                        key={r.month}
                                        className="border-t border-gray-300"
                                    >
                                        <td className="px-4 py-2">
                                            {r.month}
                                            {getOrdinal(r.month)} Payment
                                        </td>
                                        <td className="px-4 py-2">
                                            {money(r.amount)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {fmt(r.due_date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* SIGNATURES */}
                    <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <div className="h-12 border-b border-gray-400"></div>
                            <p className="mt-2 text-sm">
                                <strong>Client:</strong> {loan.client_name}
                            </p>
                            <p className="text-xs text-gray-500">
                                Signature & Date
                            </p>
                        </div>
                        <div>
                            <div className="h-12 border-b border-gray-400"></div>
                            <p className="mt-2 text-sm">
                                <strong>Manager:</strong>{" "}
                                {loan.user?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Signature & Date
                            </p>
                        </div>
                    </section>

                    <footer className="mt-12 border-t border-gray-400 pt-3 text-center text-xs text-gray-600">
                        <p>
                            <strong>
                                {settings?.company_name ||
                                    "Joelaar Micro-Credit Services"}
                            </strong>{" "}
                            | {settings?.address || "Bolgatanga, Ghana"} | Tel:{" "}
                            {settings?.phone || "+233 24 123 4567"} | Email:{" "}
                            {settings?.email || "info@joelaarcredit.com"}
                        </p>
                        <p className="mt-1 italic text-gray-500">
                            “This document is system-generated and valid without
                            signature.”
                        </p>
                    </footer>
                </div>
            </div>

            {/* PRINT STYLES */}
            <style>{`
              @media print {
                header, nav, aside, .no-print {
                  display: none !important;
                }
                #agreement-wrapper {
                  background: white !important;
                  color: black !important;
                  box-shadow: none !important;
                  border: none !important;
                  width: 100% !important;
                  margin: 0 auto !important;
                  padding: 0.5in !important;
                }
              }
            `}</style>
        </AuthenticatedLayout>
    );
}

// 📘 Ordinal suffix helper
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
