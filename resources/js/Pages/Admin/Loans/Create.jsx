import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useMemo, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function LoanCreate() {
    const {
        auth,
        prefill_client_name,
        prefill_customer_id,
        defaults,
        basePath = "admin",
        flash = {},
    } = usePage().props;

    const toastShown = useRef(false);

    const urlParams = new URLSearchParams(window.location.search);
    const prefillAmount = urlParams.get("loan_amount");

    // ✅ Automatically load interest rate from settings (defaults)
    const interestRateFromSettings = defaults?.interest_rate ?? 20;

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: prefill_customer_id || urlParams.get("customer_id") || "",
        client_name: prefill_client_name || "",
        amount: prefillAmount || "",
        interest_rate: interestRateFromSettings, // ✅ pulled directly
        term_months: "",
        start_date: new Date().toISOString().split("T")[0],
        due_date: "",
        notes: "",
    });

    // ✅ Flash Toasts
    useEffect(() => {
        if (!toastShown.current) {
            if (flash?.success) {
                toast.success(flash.success, { duration: 3000 });
                toastShown.current = true;
            } else if (flash?.error) {
                toast.error(flash.error, { duration: 3000 });
                toastShown.current = true;
            }
        }
    }, [flash]);

    // ✅ Auto calculate due date
    useEffect(() => {
        if (data.start_date && data.term_months) {
            const start = new Date(data.start_date);
            const due = new Date(start);
            due.setMonth(start.getMonth() + Number(data.term_months));
            setData("due_date", due.toISOString().split("T")[0]);
        }
    }, [data.start_date, data.term_months]);

    // ✅ Loan Calculation
    const { paymentSchedule, totalPayable } = useMemo(() => {
        const months = Number(data.term_months || 0);
        const amount = Number(data.amount || 0);

        if (!amount || !months) return { paymentSchedule: [], totalPayable: 0 };

        const rates = {
            1: 1.2,
            2: 0.655,
            3: 0.475,
            4: 0.39,
            5: 0.335,
            6: 0.305,
        };

        const multiplier = rates[months] || 1.2;
        const monthlyPayment = amount * multiplier;
        const total = monthlyPayment * months;

        const schedule = Array.from({ length: months }, (_, i) => {
            const date = new Date(data.start_date);
            date.setMonth(date.getMonth() + (i + 1));
            return {
                month: i + 1,
                amount_payable: monthlyPayment.toFixed(2),
                due_date: date.toISOString().split("T")[0],
            };
        });

        return { paymentSchedule: schedule, totalPayable: total };
    }, [data.amount, data.term_months, data.start_date]);

    // ✅ Submit
    const submit = (e) => {
        e.preventDefault();
        if (processing) return;

        post(route(`${basePath}.loans.store`), {
            preserveScroll: true,
            onSuccess: (page) => {
                if (
                    !page.props.errors ||
                    Object.keys(page.props.errors).length === 0
                ) {
                    toast.success("✅ Loan created successfully!", {
                        duration: 3000,
                    });
                    toastShown.current = true;
                    setTimeout(() => {
                        router.visit(route(`${basePath}.loans.index`));
                    }, 1200);
                }
            },
            onError: (err) => {
                if (err && Object.keys(err).length > 0) {
                    toast.error(
                        Object.values(err)[0] ||
                            "⚠️ Please fix validation errors.",
                        { duration: 3000 },
                    );
                }
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

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 🡨 Back Button */}
                <div className="mb-4">
                    <Link
                        href={route(`${basePath}.customers.index`)}
                        className="text-gray-600 text-sm hover:text-indigo-600 flex items-center gap-1 transition"
                    >
                        <span className="text-lg">←</span> Back to Customers
                    </Link>
                </div>

                {/* 🧾 Loan Form Card */}
                <form
                    onSubmit={submit}
                    className="bg-white shadow-xl rounded-lg p-6 space-y-6 border border-gray-200 transition hover:shadow-2xl duration-200"
                >
                    {/* 🧍 Client Info */}
                    <div className="border-b pb-4 flex flex-wrap justify-between items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Client Information
                        </h3>
                        <div className="flex gap-6 text-gray-700">
                            <p>
                                <strong>Name:</strong> {data.client_name}
                            </p>
                            <p>
                                <strong>Customer ID:</strong> {data.customer_id}
                            </p>
                        </div>
                    </div>

                    {/* 💰 Loan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Loan Amount (₵)"
                            type="number"
                            value={data.amount}
                            setValue={(v) => setData("amount", v)}
                            error={errors.amount}
                            required
                        />

                        {/* ✅ Interest Rate - Auto from settings, not editable */}
                        <Field
                            label="Interest Rate (%)"
                            type="number"
                            value={data.interest_rate}
                            setValue={(v) => setData("interest_rate", v)}
                            error={errors.interest_rate}
                            required
                            disabled // ✅ read-only
                        />

                        <div>
                            <label className="block text-sm text-gray-700">
                                Loan Term (Months){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.term_months}
                                onChange={(e) => {
                                    const months = Number(e.target.value);
                                    if (months > 6) {
                                        toast.error(
                                            "Maximum term is 6 months.",
                                            { duration: 2500 },
                                        );
                                        setData("term_months", 6);
                                    } else {
                                        setData("term_months", months);
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition"
                                required
                            >
                                <option value="">Select term...</option>
                                {[1, 2, 3, 4, 5, 6].map((m) => (
                                    <option key={m} value={m}>
                                        {m} {m === 1 ? "Month" : "Months"}
                                    </option>
                                ))}
                            </select>
                            {errors.term_months && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.term_months}
                                </p>
                            )}
                        </div>

                        <Field
                            label="Start Date"
                            type="date"
                            value={data.start_date}
                            setValue={(v) => setData("start_date", v)}
                            error={errors.start_date}
                            required
                        />
                        <Field
                            label="Due Date"
                            type="date"
                            value={data.due_date}
                            setValue={(v) => setData("due_date", v)}
                            error={errors.due_date}
                            required
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                rows="3"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition"
                            ></textarea>
                            {errors.notes && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 📅 Payment Schedule */}
                    {paymentSchedule.length > 0 && (
                        <div className="mt-6 animate-fadeIn">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                Payment Schedule
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200 rounded-md">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="p-2 border">
                                                Month
                                            </th>
                                            <th className="p-2 border">
                                                Amount Payable (₵)
                                            </th>
                                            <th className="p-2 border">
                                                Due Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentSchedule.map((item) => (
                                            <tr
                                                key={item.month}
                                                className="text-center"
                                            >
                                                <td className="border p-2">
                                                    {item.month}
                                                </td>
                                                <td className="border p-2 font-semibold">
                                                    {item.amount_payable}
                                                </td>
                                                <td className="border p-2">
                                                    {item.due_date}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end mt-4">
                                <div className="bg-green-50 border border-green-500 text-green-700 font-bold px-6 py-3 rounded-lg shadow-sm">
                                    Total Payable (₵): {totalPayable.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end border-t pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                        >
                            {processing ? "Saving..." : "Save Loan"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

/* 🔹 Reusable Field Component */
function Field({
    label,
    type = "text",
    value,
    setValue,
    error,
    required,
    min,
    max,
    disabled,
}) {
    return (
        <div className="transition">
            <label className="block text-sm text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                min={min}
                max={max}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition disabled:bg-gray-100"
                required={required}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
