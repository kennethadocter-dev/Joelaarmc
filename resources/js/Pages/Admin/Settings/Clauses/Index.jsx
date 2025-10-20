import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function SettingsIndex() {
    const { flash, settings } = usePage().props;

    // 🧠 Form state
    const { data, setData, put, processing, errors } = useForm({
        company_name: settings?.company_name || "",
        address: settings?.address || "",
        phone: settings?.phone || "",
        email: settings?.email || "",
        bank_name: settings?.bank_name || "",
        bank_account_number: settings?.bank_account_number || "",
        manager_name: settings?.manager_name || "",
        manager_title: settings?.manager_title || "",
        default_interest_rate: settings?.default_interest_rate ?? 0,
        default_term_months: settings?.default_term_months ?? 1,
        default_penalty_rate: settings?.default_penalty_rate ?? 0,
        grace_period_days: settings?.grace_period_days ?? 0,
        allow_early_repayment: settings?.allow_early_repayment ?? false,
    });

    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setTimeout(() => setToastMessage(null), 3000);
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        put(route("settings.update"));
    };

    return (
        <AuthenticatedLayout header="Settings">
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* ✅ Success Toast */}
                {toastMessage && (
                    <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-lg transition-opacity animate-fade-in">
                        {toastMessage}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        ⚙️ System Settings
                    </h2>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Company Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={data.company_name}
                                onChange={(e) => setData("company_name", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            />
                            {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Address
                            </label>
                            <textarea
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            />
                            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                        </div>

                        {/* other fields... */}

                        <div className="mt-8 text-right">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}