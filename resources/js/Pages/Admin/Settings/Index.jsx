import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

// ✅ Simple toast component
function Toast({ message, type, onClose }) {
    if (!message) return null;
    return (
        <div
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
                type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
        >
            <div className="flex items-center gap-3">
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 font-bold"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

// ✅ Confirmation modal
function ConfirmModal({ show, onConfirm, onCancel }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    ⚠️ Confirm Reset
                </h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to reset all settings to their default
                    values? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Yes, Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SettingsIndex() {
    const { settings, flash, basePath } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        bank_name: settings.bank_name || "",
        bank_account_number: settings.bank_account_number || "",
        manager_name: settings.manager_name || "",
        manager_title: settings.manager_title || "",
        default_interest_rate: settings.default_interest_rate ?? 20,
        default_term_months: settings.default_term_months ?? 3,
        default_penalty_rate: settings.default_penalty_rate ?? 0.5,
        grace_period_days: settings.grace_period_days ?? 0,
        allow_early_repayment: !!settings.allow_early_repayment,
        _method: "put",
    });

    const [toast, setToast] = useState({ message: "", type: "success" });
    const [showConfirm, setShowConfirm] = useState(false);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 3500);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route(`${basePath}.settings.update`), {
            forceFormData: true,
            onSuccess: () =>
                showToast("✅ Settings saved successfully!", "success"),
            onError: () => showToast("⚠️ Failed to save settings.", "error"),
        });
    };

    const handleReset = () => {
        router.put(
            route(`${basePath}.settings.reset`),
            {},
            {
                onSuccess: () => {
                    setShowConfirm(false);
                    showToast(
                        "🔁 Settings reset to default values!",
                        "success",
                    );
                },
                onError: () => {
                    setShowConfirm(false);
                    showToast("❌ Failed to reset settings.", "error");
                },
            },
        );
    };

    // 🎉 Flash messages on page load
    useEffect(() => {
        if (flash?.success) showToast(flash.success, "success");
        if (flash?.error) showToast(flash.error, "error");
    }, [flash]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    System Settings
                </h2>
            }
        >
            <Head title="Settings" />
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: "", type: "success" })}
            />
            <ConfirmModal
                show={showConfirm}
                onConfirm={handleReset}
                onCancel={() => setShowConfirm(false)}
            />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <form onSubmit={submit} className="space-y-8">
                    {/* Organization Info */}
                    <section className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-200">
                        <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 text-gray-800">
                            Organization Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                ["Company Name", "company_name"],
                                ["Email", "email"],
                                ["Phone", "phone"],
                                ["Address", "address"],
                                ["Bank Name", "bank_name"],
                                ["Bank Account Number", "bank_account_number"],
                                ["Manager Name", "manager_name"],
                                ["Manager Title", "manager_title"],
                            ].map(([label, field]) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {label}
                                    </label>
                                    <input
                                        type={
                                            field === "email" ? "email" : "text"
                                        }
                                        className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        value={data[field]}
                                        onChange={(e) =>
                                            setData(field, e.target.value)
                                        }
                                    />
                                    {errors[field] && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors[field]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Loan Defaults */}
                    <section className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-200">
                        <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 text-gray-800">
                            Loan Defaults
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputNumber
                                label="Default Interest Rate (%)"
                                field="default_interest_rate"
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                            <InputNumber
                                label="Default Term (months)"
                                field="default_term_months"
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                            <InputNumber
                                label="Penalty Rate (% per day)"
                                field="default_penalty_rate"
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                            <InputNumber
                                label="Grace Period (days)"
                                field="grace_period_days"
                                data={data}
                                setData={setData}
                                errors={errors}
                            />

                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    id="allow_early_repayment"
                                    type="checkbox"
                                    checked={!!data.allow_early_repayment}
                                    onChange={(e) =>
                                        setData(
                                            "allow_early_repayment",
                                            e.target.checked,
                                        )
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="allow_early_repayment"
                                    className="text-sm text-gray-700"
                                >
                                    Allow Early Repayment
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setShowConfirm(true)}
                            className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition shadow"
                        >
                            ♻️ Reset to Defaults
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 rounded bg-gray-800 text-white hover:bg-black transition shadow disabled:opacity-50"
                        >
                            {processing ? "Saving..." : "💾 Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

// ✅ Helper component for numeric inputs
function InputNumber({ label, field, data, setData, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={data[field]}
                onChange={(e) => setData(field, e.target.value)}
            />
            {errors[field] && (
                <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
            )}
        </div>
    );
}
