import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { useEffect } from "react";

export default function SettingsIndex() {
    const { settings, flash, basePath } = usePage().props;
    const confirm = useConfirm();

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

    /** ✅ SUBMIT FORM FIX — uses router.post with _method: put */
    const submit = (e) => {
        e.preventDefault();

        router.post(
            route(`${basePath}.settings.update`),
            {
                ...data,
                _method: "put",
            },
            {
                forceFormData: true,
                onSuccess: () =>
                    window.toast?.success?.("✅ Settings saved successfully!"),
                onError: () =>
                    window.toast?.error?.("⚠️ Failed to save settings."),
            },
        );
    };

    /** ♻️ Reset Settings */
    const handleReset = () => {
        confirm(
            "Confirm Reset",
            "Are you sure you want to reset all settings to default values? This action cannot be undone.",
            () => {
                router.put(
                    route(`${basePath}.settings.reset`),
                    {},
                    {
                        onSuccess: () =>
                            window.toast?.success?.(
                                "🔁 Settings reset to default values!",
                            ),
                        onError: () =>
                            window.toast?.error?.(
                                "❌ Failed to reset settings.",
                            ),
                    },
                );
            },
            "danger",
        );
    };

    /** 🎉 Flash Messages */
    useEffect(() => {
        if (flash?.success) window.toast?.success?.(flash.success);
        if (flash?.error) window.toast?.error?.(flash.error);
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

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <form onSubmit={submit} className="space-y-8">
                    {/* 🏢 Organization Info */}
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

                    {/* 💰 Loan Defaults */}
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

                    {/* 🔘 Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleReset}
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

/* ✅ Helper component for numeric inputs */
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
