import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useMemo } from "react";
import html2pdf from "html2pdf.js";
import { route } from "ziggy-js"; // ✅ correct modern import // ✅ ensures compatibility for basePath use

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

// 📈 Interest multiplier logic
function getEffectiveMultiplier(term, rate) {
    const base = rate / 100;
    const table = { 1: 1 + base, 2: 1.31, 3: 1.425, 4: 1.56, 5: 1.67, 6: 1.83 };
    return table[term] ?? 1 + base;
}

// 📅 Build repayment schedule
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
    } = usePage().props;

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

    const user = auth?.user || {};
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
    })} ${today.getFullYear()} between Joelaar Micro-Credit Services (hereinafter referred to as the "Lender") and ${
        loan.client_name
    } (hereinafter referred to as the "Borrower").`;

    /** 🖨 Print document */
    const handlePrint = () => {
        const element = document.getElementById("agreement-wrapper");
        if (!element) return alert("⚠️ Agreement section not found!");

        const opt = {
            margin: 0.4,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get("pdf")
            .then((pdf) => {
                const blob = pdf.output("blob");
                const blobUrl = URL.createObjectURL(blob);
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = blobUrl;
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                };
            });
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
        } catch (err) {
            console.error("Refresh failed:", err);
            alert("⚠️ Could not refresh loan data.");
        }
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

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 print:max-w-full print:px-8">
                {/* 🔙 Top Bar */}
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
                            className="px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition"
                        >
                            ⬇ Download
                        </button>

                        <form
                            method="post"
                            action={route(
                                `${basePath}.reports.sendAgreement`,
                                loan.id,
                            )}
                            className="inline"
                        >
                            <input
                                type="hidden"
                                name="_token"
                                value={csrf_token}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow"
                            >
                                📧 Send Email
                            </button>
                        </form>

                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition shadow"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* 📝 Agreement */}
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
                                    Joelaar Micro-Credit Services
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
                            <strong>Joelaar Micro-Credit Services</strong> and{" "}
                            <strong>{loan.client_name}</strong>
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

                    <section className="space-y-4 mt-6 text-gray-800">
                        <h3 className="font-semibold text-lg">
                            CLAUSE 5: PENALTY
                        </h3>
                        <p>
                            A penalty of <strong>0.5% per day</strong> applies
                            for late payment.
                        </p>

                        <h3 className="font-semibold text-lg">
                            CLAUSE 6: DEFAULT
                        </h3>
                        <p>
                            Failure to comply with Clause 4 renders the Borrower
                            in default.
                        </p>

                        <h3 className="font-semibold text-lg">
                            CLAUSE 7: SECURITY
                        </h3>
                        <p>
                            The Borrower hypothecates present and future stock
                            as security.
                        </p>

                        <h3 className="font-semibold text-lg">
                            CLAUSE 8: GUARANTORS
                        </h3>
                        <p>
                            Guarantors are personally liable for all unpaid
                            balances.
                        </p>

                        {guarantors?.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold">Guarantors:</h4>
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    {guarantors.map((g) => (
                                        <li key={g.id}>
                                            <strong>{g.name}</strong> —{" "}
                                            {g.occupation || "N/A"},{" "}
                                            {g.residence || "N/A"} —{" "}
                                            {g.contact || "No contact"}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    {/* ✍ Signatures */}
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

                    <div className="mt-6 text-sm">
                        <strong>Bank Account Number:</strong>{" "}
                        {loan.customer?.bank_account ||
                            "____________________________"}
                    </div>

                    <footer className="mt-12 border-t border-gray-400 pt-3 text-center text-xs text-gray-600">
                        <p>
                            <strong>Joelaar Micro-Credit Services</strong> |
                            Bolgatanga, Ghana | Tel:
                            <span className="text-gray-700">
                                {" "}
                                +233 24 123 4567{" "}
                            </span>
                            | Email:{" "}
                            <span className="text-gray-700">
                                info@joelaarcredit.com
                            </span>
                        </p>
                        <p className="mt-1 italic text-gray-500">
                            “This document is system-generated and valid without
                            signature.”
                        </p>
                    </footer>
                </div>
            </div>

            <style>{`
              @media print {
                header, nav, footer.no-print, aside, [data-sidebar], [data-header] {
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
