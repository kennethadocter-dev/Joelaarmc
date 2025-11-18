import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function RecordPayment() {
    const {
        loan,
        expectedAmount = 0,
        auth,
        flash = {},
        basePath = "admin",
        redirect,
    } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        loan_id: loan?.id || "",
        amount: expectedAmount || "",
        note: "",
        redirect: redirect || route(`${basePath}.loans.show`, loan?.id),
    });

    const [locked, setLocked] = useState(false);

    /* 🔔 Flash messages */
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    /* 💾 Submit payment (Clean, no timeout, fully reactive) */
    const submit = (e) => {
        e.preventDefault();

        if (locked || processing) return;
        setLocked(true);

        post(route(`${basePath}.payments.store`), {
            preserveScroll: true,

            onSuccess: () => {
                toast.success("✅ Cash payment recorded successfully!");

                // FRONTEND → redirect to loan details (always reloads fresh data)
                router.visit(data.redirect, {
                    replace: true,
                    preserveScroll: true,
                });

                reset();
            },

            onError: (err) => {
                const firstError =
                    err && Object.keys(err).length
                        ? Object.values(err)[0]
                        : "⚠️ Failed to record payment.";
                toast.error(firstError);
            },

            onFinish: () => {
                setLocked(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    💵 Record Cash Payment
                </h2>
            }
        >
            <Head title="Record Cash Payment" />
            <Toaster position="top-right" />

            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6 border border-gray-100 mt-6">
                {/* 🡨 Back */}
                <div>
                    <Link
                        href={data.redirect}
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                        <span className="text-lg">←</span> Back to Loan Details
                    </Link>
                </div>

                {/* 💰 Payment Form */}
                <form onSubmit={submit} className="space-y-5 mt-4">
                    <input
                        type="hidden"
                        name="redirect"
                        value={data.redirect}
                    />

                    {/* Received By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Received By
                        </label>
                        <input
                            type="text"
                            value={auth?.user?.name || ""}
                            disabled
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-sm"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Amount to Receive (₵)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.amount}
                            </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                            Expected: ₵{Number(expectedAmount).toFixed(2)}
                        </p>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Note (optional)
                        </label>
                        <textarea
                            rows="3"
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                            placeholder="Add any note..."
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-3">
                        <button
                            type="submit"
                            disabled={processing || locked}
                            className={`${
                                processing || locked
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            } text-white px-6 py-2 rounded-md text-sm font-semibold transition`}
                        >
                            {processing || locked
                                ? "Recording..."
                                : "Record Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
