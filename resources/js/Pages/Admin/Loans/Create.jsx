import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { route } from "ziggy-js";

export default function LoanCreate() {
    const {
        basePath = "admin",
        prefill_customer_id,
        prefill_client_name,
        prefill_amount,
        flash = {},
    } = usePage().props;

    const urlParams = new URLSearchParams(window.location.search);
    const queryCustomerId = urlParams.get("customer_id");
    const queryAmount = urlParams.get("requested_amount");
    const queryClientName = urlParams.get("client_name");

    const flashCustomer = flash?.customer || {};

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id:
            queryCustomerId || prefill_customer_id || flashCustomer.id || "",
        client_name:
            queryClientName ||
            prefill_client_name ||
            flashCustomer.full_name ||
            "",
        amount:
            queryAmount ||
            prefill_amount ||
            flashCustomer.loan_amount_requested ||
            "",
        term_months: "",
        interest_rate: 20, // ✅ Default 20%
        start_date: new Date().toISOString().slice(0, 10),
        notes: "",
    });

    const [schedule, setSchedule] = useState([]);
    const [summary, setSummary] = useState({
        totalPayment: 0,
        monthlyPayment: 0,
        totalInterest: 0,
    });

    // 💰 Real repayment logic based on ₵200 base loan
    const baseRates = {
        1: 240,
        2: 131 * 2,
        3: 95 * 3,
        4: 78 * 4,
        5: 67 * 5,
        6: 61 * 6,
    };

    // 🧮 Auto calculate schedule and summary
    useEffect(() => {
        const amount = parseFloat(data.amount) || 0;
        const months = parseInt(data.term_months) || 0;

        if (amount > 0 && months > 0) {
            const scale = amount / 200;
            const totalPayment = baseRates[months] * scale;
            const monthlyPayment = totalPayment / months;
            const totalInterest = totalPayment - amount;

            setSummary({
                totalPayment: totalPayment.toFixed(2),
                monthlyPayment: monthlyPayment.toFixed(2),
                totalInterest: totalInterest.toFixed(2),
            });

            const newSchedule = Array.from({ length: months }, (_, i) => ({
                num: i + 1,
                due: new Date(
                    new Date(data.start_date).setMonth(
                        new Date(data.start_date).getMonth() + i + 1,
                    ),
                )
                    .toISOString()
                    .slice(0, 10),
                amount: monthlyPayment.toFixed(2),
            }));

            setSchedule(newSchedule);
        } else {
            setSchedule([]);
            setSummary({
                totalPayment: 0,
                monthlyPayment: 0,
                totalInterest: 0,
            });
        }
    }, [data.amount, data.term_months, data.start_date]);

    // 🧾 Submit
    const handleSubmit = (e) => {
        e.preventDefault();

        post(route(`${basePath}.loans.store`), {
            onSuccess: () => {
                toast.success("✅ Loan created successfully!", {
                    duration: 2000,
                });
                setTimeout(() => {
                    router.visit(route(`${basePath}.loans.index`));
                }, 1500);
                reset();
            },
            onError: (errs) => {
                const first =
                    errs && Object.values(errs)?.[0]
                        ? Array.isArray(Object.values(errs)[0])
                            ? Object.values(errs)[0][0]
                            : Object.values(errs)[0]
                        : "⚠️ Please check highlighted fields.";
                toast.error(first, { duration: 3000 });
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Create Loan
                </h2>
            }
        >
            <Head title="Create Loan" />
            <Toaster position="top-right" />

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
                {/* 🔙 Back */}
                <div className="flex justify-start mb-4">
                    <Link
                        href={route(`${basePath}.loans.index`)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border"
                    >
                        ← Back
                    </Link>
                </div>

                {/* 🧾 Loan Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-white p-6 rounded-lg shadow"
                >
                    {/* BASIC DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Client Name *"
                            value={data.client_name}
                            onChange={(v) => setData("client_name", v)}
                            required
                        />
                        <Field
                            label="Loan Amount (₵)"
                            type="number"
                            value={data.amount}
                            onChange={(v) => setData("amount", v)}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Term (Months){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="input"
                                value={data.term_months}
                                onChange={(e) =>
                                    setData("term_months", e.target.value)
                                }
                                required
                            >
                                <option value="">Select...</option>
                                {[1, 2, 3, 4, 5, 6].map((m) => (
                                    <option key={m} value={m}>
                                        {m} Month{m > 1 && "s"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ✅ New Interest Rate Field */}
                        <Field
                            label="Interest Rate (%)"
                            type="number"
                            value={data.interest_rate}
                            onChange={(v) => setData("interest_rate", v)}
                            required
                        />
                        <Field
                            label="Start Date"
                            type="date"
                            value={data.start_date}
                            onChange={(v) => setData("start_date", v)}
                        />
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Notes
                        </label>
                        <textarea
                            className="input h-24"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Optional remarks..."
                        ></textarea>
                    </div>

                    {/* 🌟 Summary */}
                    {schedule.length > 0 && (
                        <div className="bg-gray-50 border rounded-lg p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                                Loan Summary
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                <SummaryBox
                                    icon="📅"
                                    label="Term"
                                    value={`${data.term_months} Month(s)`}
                                />
                                <SummaryBox
                                    icon="💸"
                                    label="Monthly Payment"
                                    value={`₵${summary.monthlyPayment}`}
                                />
                                <SummaryBox
                                    icon="💰"
                                    label="Total Payment"
                                    value={`₵${summary.totalPayment}`}
                                />
                                <SummaryBox
                                    icon="📊"
                                    label="Total Interest"
                                    value={`₵${summary.totalInterest}`}
                                    highlight
                                />
                                <SummaryBox
                                    icon="📈"
                                    label="Interest Rate"
                                    value={`${data.interest_rate}%`}
                                />
                            </div>
                        </div>
                    )}

                    {/* TABLE */}
                    {schedule.length > 0 && (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left">
                                            #
                                        </th>
                                        <th className="px-4 py-2 text-left">
                                            Due Date
                                        </th>
                                        <th className="px-4 py-2 text-left">
                                            Payment (₵)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map((item) => (
                                        <tr key={item.num} className="border-t">
                                            <td className="px-4 py-2">
                                                {item.num}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.due}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="flex justify-between pt-4 border-t">
                        <Link
                            href={route(`${basePath}.loans.index`)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border"
                        >
                            ← Back
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {processing ? "Saving..." : "Save Loan"}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .input {
                    width: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: .375rem;
                    padding: .5rem .75rem;
                    background: white;
                    color: #111827;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

/* 🔹 Reusable input field */
function Field({ label, type = "text", value, onChange, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                className="input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </div>
    );
}

/* 💎 Reusable summary box */
function SummaryBox({ icon, label, value, highlight = false }) {
    return (
        <div
            className={`p-3 rounded-md text-center shadow-sm ${
                highlight
                    ? "bg-green-50 border border-green-300 text-green-800 font-semibold"
                    : "bg-white border text-gray-700"
            }`}
        >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-sm font-medium">{label}</div>
            <div className="text-base font-semibold mt-1">{value}</div>
        </div>
    );
}
