import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function RecordPayment() {
    const { loan, expectedAmount, auth, flash, basePath } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        loan_id: loan?.id || "",
        amount: expectedAmount || "",
        note: "",
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();

        // ✅ Force correct absolute route path (bypass Inertia’s route confusion)
        post(`/${basePath}/loans/${loan.id}/record-payment`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("✅ Cash payment recorded successfully!");
                setData("note", "");
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

            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
                <Link
                    href={`/${basePath}/loans/${loan.id}`}
                    className="text-sm text-gray-500 hover:text-indigo-600"
                >
                    ← Back to Loan Details
                </Link>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Received By
                        </label>
                        <input
                            type="text"
                            value={auth.user.name}
                            disabled
                            className="w-full mt-1 border rounded-md px-3 py-2 bg-gray-100 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Amount to Receive (₵)
                        </label>
                        <input
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                            required
                            step="0.01"
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm">
                                {errors.amount}
                            </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                            Expected: ₵{expectedAmount?.toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Note
                        </label>
                        <textarea
                            rows="3"
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                            placeholder="Add any note about this payment (optional)"
                            className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                        ></textarea>
                        {errors.note && (
                            <p className="text-red-500 text-sm">
                                {errors.note}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition"
                        >
                            {processing ? "Recording..." : "Record Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
