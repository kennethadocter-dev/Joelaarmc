import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link, router } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function RecordPayment() {
    const {
        loan,
        expectedAmount = 0,
        auth,
        flash = {},
        basePath = "admin",
        redirect, // ✅ Comes from backend props (PaymentController@create)
    } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        loan_id: loan?.id || "",
        amount: expectedAmount || "",
        note: "",
        redirect: redirect || `/${basePath}/loans/${loan?.id}`, // ✅ auto fallback
    });

    const toastShown = useRef(false);

    // ✅ Handle Laravel flash messages (on reload/redirect)
    useEffect(() => {
        if (!toastShown.current) {
            if (flash.success) {
                toast.success(flash.success);
                toastShown.current = true;
            } else if (flash.error) {
                toast.error(flash.error);
                toastShown.current = true;
            }
        }
    }, [flash]);

    // ✅ Submit handler
    const submit = (e) => {
        e.preventDefault();

        post(`/${basePath}/payments/store`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("✅ Cash payment recorded successfully!");
                reset("note", "amount");
                setTimeout(() => {
                    router.visit(data.redirect); // ✅ redirect back to loan page
                }, 800);
            },
            onError: (err) => {
                console.error("❌ Payment error:", err);
                toast.error("⚠️ Failed to record payment. Please try again.");
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
                    {/* Hidden redirect field */}
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

                    {/* Amount Field */}
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

                    {/* Note Field */}
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

                    {/* Submit Button */}
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
