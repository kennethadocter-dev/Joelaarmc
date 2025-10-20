import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import { useMemo, useEffect, useState } from "react";

/**
 * 🔹 Build monthly schedule with rounding fix
 */
function buildPreviewSchedule(amount, ratePct, term, startDate) {
    if (!amount || !ratePct || !term || !startDate) return [];

    const principal = parseFloat(amount);
    const termInt = parseInt(term, 10);

    const multipliers = {
        1: 1.2,
        2: 1.31,
        3: 1.425,
        4: 1.56,
        5: 1.67,
        6: 1.83,
    };

    const multiplier = multipliers[termInt] ?? 1 + ratePct / 100;
    const total = principal * multiplier;
    const ceil2 = (n) => Math.ceil(n * 100) / 100;

    const rawMonthly = total / termInt;
    const schedule = [];

    for (let i = 1; i < termInt; i++) {
        const installment = ceil2(rawMonthly);
        const due = new Date(startDate);
        due.setMonth(due.getMonth() + i);
        schedule.push({
            month: i,
            label:
                i === 1
                    ? "1st Payment"
                    : i === 2
                      ? "2nd Payment"
                      : i === 3
                        ? "3rd Payment"
                        : `${i}th Payment`,
            installment,
            due_date: due.toISOString().split("T")[0],
        });
    }

    const paid = schedule.reduce((s, r) => s + r.installment, 0);
    const lastInstallment = Math.round((total - paid) * 100) / 100;
    const lastDue = new Date(startDate);
    lastDue.setMonth(lastDue.getMonth() + termInt);

    schedule.push({
        month: termInt,
        label: `${termInt}th Payment`,
        installment: lastInstallment,
        due_date: lastDue.toISOString().split("T")[0],
    });

    return schedule;
}

export default function Create() {
    const {
        prefill_client_name = "",
        prefill_customer_id = "",
        defaults = {},
        suggested_amount,
        auth,
        flash,
        basePath = "admin",
    } = usePage().props;

    const loggedInUser = auth?.user;
    const [showSchedule, setShowSchedule] = useState(true);

    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: loggedInUser?.id || "",
        customer_id: prefill_customer_id || "",
        client_name: prefill_client_name || "",
        amount: suggested_amount ? parseFloat(suggested_amount) : "",
        interest_rate: defaults?.interest_rate
            ? parseFloat(defaults.interest_rate)
            : "",
        term_months: defaults?.term_months
            ? parseInt(defaults.term_months, 10)
            : 1,
        start_date: new Date().toISOString().split("T")[0],
        due_date: "",
        notes: "",
    });

    // 🔄 Auto-update due date
    useEffect(() => {
        if (data.start_date && data.term_months) {
            const s = new Date(data.start_date);
            s.setMonth(s.getMonth() + parseInt(data.term_months, 10));
            setData("due_date", s.toISOString().split("T")[0]);
        }
    }, [data.start_date, data.term_months]);

    // 📆 Preview schedule
    const preview = useMemo(() => {
        if (!data.amount || !data.interest_rate || !data.term_months) return [];
        return buildPreviewSchedule(
            data.amount,
            data.interest_rate,
            data.term_months,
            data.start_date,
        );
    }, [data.amount, data.interest_rate, data.term_months, data.start_date]);

    const totalDue = preview.reduce((s, r) => s + r.installment, 0);
    const monthly = preview.length ? preview[0].installment : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.customer_id) {
            alert("⚠️ Missing customer. Please select a client first.");
            return;
        }

        post(route(`${basePath}.loans.store`), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                router.visit(route(`${basePath}.loans.index`));
            },
        });
    };

    const missingCustomer = !prefill_customer_id || !prefill_client_name;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Create Loan
                </h2>
            }
        >
            <Head title="Create Loan" />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ✅ Flash messages */}
                {flash?.success && (
                    <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded shadow">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 px-4 py-2 bg-red-100 text-red-800 rounded shadow">
                        {flash.error}
                    </div>
                )}

                {/* Missing client notice */}
                {missingCustomer ? (
                    <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">
                            Client Not Selected
                        </h3>
                        <p className="text-yellow-700">
                            Please select or register a customer before creating
                            a loan.
                        </p>
                        <div className="mt-4">
                            <Link
                                href={route(`${basePath}.customers.index`)}
                                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                ← Back to Customers
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        {/* Client header */}
                        <div className="mb-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    alert(
                                        `Currently creating loan for ${data.client_name}`,
                                    )
                                }
                                className="px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-black transition"
                            >
                                💡 Creating loan for: {data.client_name}
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Due
                                </p>
                                <p className="text-xl font-bold text-blue-700">
                                    ₵{Math.ceil(totalDue).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Monthly Payment
                                </p>
                                <p className="text-xl font-bold text-green-700">
                                    ₵{Math.ceil(monthly).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Interest Rate
                                </p>
                                <p className="text-xl font-bold text-indigo-700">
                                    {data.interest_rate || 0}%
                                </p>
                            </div>
                        </div>

                        {/* Loan Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Staff */}
                            <Field
                                label="Borrower (Staff)"
                                value={loggedInUser?.name || ""}
                                readOnly
                            />

                            {/* Client */}
                            <Field
                                label="Client Name"
                                value={data.client_name}
                                readOnly
                            />
                            <input
                                type="hidden"
                                name="customer_id"
                                value={data.customer_id}
                            />

                            {/* Amount */}
                            <Field
                                label="Amount (₵)"
                                type="number"
                                value={data.amount}
                                onChange={(e) =>
                                    setData(
                                        "amount",
                                        e.target.value === ""
                                            ? ""
                                            : parseFloat(e.target.value),
                                    )
                                }
                                required
                            />

                            {/* Interest Rate */}
                            <Field
                                label="Interest Rate (%)"
                                type="number"
                                value={data.interest_rate}
                                onChange={(e) =>
                                    setData(
                                        "interest_rate",
                                        e.target.value === ""
                                            ? ""
                                            : parseFloat(e.target.value),
                                    )
                                }
                                required
                            />

                            {/* Term */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SelectField
                                    label="Term (months)"
                                    value={data.term_months}
                                    onChange={(e) =>
                                        setData(
                                            "term_months",
                                            parseInt(e.target.value, 10),
                                        )
                                    }
                                    options={[1, 2, 3, 4, 5, 6].map((m) => ({
                                        value: m,
                                        label: `${m}`,
                                    }))}
                                />

                                <Field
                                    label="Start Date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData("start_date", e.target.value)
                                    }
                                    required
                                />
                                <Field
                                    label="Final Due Date"
                                    type="date"
                                    value={data.due_date}
                                    readOnly
                                />
                            </div>

                            {/* Schedule */}
                            <div className="border-t pt-5">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">
                                        Monthly Payment Schedule
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSchedule((prev) => !prev)
                                        }
                                        className="force-white bg-gray-800 px-3 py-1.5 rounded-md text-sm hover:bg-gray-900 transition"
                                    >
                                        {showSchedule
                                            ? "Hide Schedule ▲"
                                            : "Show Schedule ▼"}
                                    </button>
                                </div>

                                {showSchedule && (
                                    <>
                                        {preview.length ? (
                                            <div className="overflow-x-auto mt-3">
                                                <table className="min-w-full text-sm bg-gray-50 rounded">
                                                    <thead>
                                                        <tr className="text-gray-800">
                                                            <th className="px-4 py-2 text-left">
                                                                Payment
                                                            </th>
                                                            <th className="px-4 py-2 text-left">
                                                                Amount
                                                            </th>
                                                            <th className="px-4 py-2 text-left">
                                                                Due Date
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {preview.map((p) => (
                                                            <tr
                                                                key={p.month}
                                                                className="border-t"
                                                            >
                                                                <td className="px-4 py-2">
                                                                    {p.label}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    ₵
                                                                    {p.installment.toFixed(
                                                                        2,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {p.due_date}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 mt-3">
                                                Enter amount, rate, and term to
                                                preview schedule.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm text-gray-700">
                                    Notes (optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData("notes", e.target.value)
                                    }
                                    className="w-full border rounded p-2 text-gray-800"
                                    placeholder="Any special conditions..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center pt-4 border-t">
                                <Link
                                    href={route(`${basePath}.loans.index`)}
                                    className="text-gray-600 hover:underline"
                                >
                                    ← Back to Loans
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Create Loan"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* 🔹 Helpers */
function Field({ label, value, onChange, type = "text", required, readOnly }) {
    return (
        <div>
            <label className="block text-sm text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                className={`mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 ${
                    readOnly
                        ? "bg-gray-100 text-gray-700 cursor-not-allowed"
                        : ""
                }`}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm text-gray-700">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
