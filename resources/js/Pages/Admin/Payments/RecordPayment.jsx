import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link, router } from "@inertiajs/react";
import { useEffect } from "react";

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

    /* ✅ Flash messages on load */
    useEffect(() => {
        if (flash?.success) window.toast?.success?.(flash.success);
        if (flash?.error) window.toast?.error?.(flash.error);
    }, [flash]);

    /* 💾 Submit payment */
    const submit = (e) => {
        e.preventDefault();
        if (processing) return;

        post(route(`${basePath}.payments.store`), {
            preserveScroll: true,
            onSuccess: () => {
                window.toast?.success?.(
                    "✅ Cash payment recorded successfully!",
                );
                reset("note", "amount");
                setTimeout(() => {
                    router.visit(data.redirect);
                }, 1000);
            },
            onError: (err) => {
                const firstError =
                    err && Object.keys(err).length
                        ? Object.values(err)[0]
                        : "⚠️ Failed to record payment. Please try again.";
                window.toast?.error?.(firstError);
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

            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6 border border-gray-100 mt-6">
                {/* 🡨 Back link */}
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
                            placeholder="Add any note about this payment..."
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {errors.note && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.note}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className={`${
                                processing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            } text-white px-6 py-2 rounded-md text-sm font-semibold transition`}
                        >
                            {processing ? "Recording..." : "Record Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
