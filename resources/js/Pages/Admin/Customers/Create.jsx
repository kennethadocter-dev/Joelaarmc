import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { route } from "ziggy-js";

export default function CustomerCreate() {
    const { basePath = "admin", flash = {} } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: "",
        phone: "",
        email: "",
        marital_status: "",
        gender: "",
        house_no: "",
        address: "",
        community: "",
        location: "",
        district: "",
        postal_address: "",
        workplace: "",
        profession: "",
        employer: "",
        bank: "",
        bank_branch: "",
        has_bank_loan: false,
        bank_monthly_deduction: "",
        take_home: "",
        loan_amount_requested: "",
        loan_purpose: "",
        guarantors: [{ name: "", contact: "" }],
    });

    const [showPopup, setShowPopup] = useState(false);

    // ✅ Flash feedback for success or error
    useEffect(() => {
        if (flash?.success && flash?.customer) setShowPopup(true);
        if (flash?.success && !flash?.customer)
            toast.success(flash.success, { duration: 2000 });
        if (flash?.error) toast.error(flash.error, { duration: 3000 });
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route(`${basePath}.customers.store`), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Add Customer
                </h2>
            }
        >
            <Head title="Add Customer" />
            <Toaster position="top-right" />

            {/* ✅ Success Popup */}
            {showPopup && flash?.customer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center relative transform animate-slideDown">
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            title="Close"
                        >
                            ×
                        </button>

                        <div className="mb-4">
                            <div className="mx-auto bg-green-100 text-green-700 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                                ✅
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                Customer Added Successfully!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {flash.success ||
                                    "New customer registered successfully."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href={route(`${basePath}.customers.create`)}
                                className="flex-1 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                            >
                                ➕ Add Another
                            </Link>

                            <Link
                                href={route(`${basePath}.loans.create`, {
                                    customer_id: flash.customer.id,
                                    client_name: flash.customer.full_name,
                                    amount_requested:
                                        flash.customer.loan_amount_requested,
                                })}
                                className="flex-1 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
                            >
                                💰 Create Loan
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 🧾 CUSTOMER FORM */}
            <div className="py-8 max-w-5xl mx-auto px-4 space-y-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded-lg p-6 space-y-8"
                >
                    {/* 🧍 Personal Details */}
                    <Section title="Personal Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Full Name *"
                                required
                                value={data.full_name}
                                onChange={(v) => setData("full_name", v)}
                                error={errors.full_name}
                            />
                            <Field
                                label="Phone *"
                                required
                                value={data.phone}
                                onChange={(v) => setData("phone", v)}
                                error={errors.phone}
                            />
                            <Field
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(v) => setData("email", v)}
                                error={errors.email}
                            />
                            <SelectField
                                label="Marital Status"
                                value={data.marital_status}
                                onChange={(v) => setData("marital_status", v)}
                                options={[
                                    "Single",
                                    "Married",
                                    "Divorced",
                                    "Widowed",
                                ]}
                            />
                            <SelectField
                                label="Gender"
                                value={data.gender}
                                onChange={(v) => setData("gender", v)}
                                options={["Male", "Female", "Other"]}
                            />
                        </div>
                    </Section>

                    {/* 🏠 Address Info */}
                    <Section title="Address Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="House No"
                                value={data.house_no}
                                onChange={(v) => setData("house_no", v)}
                            />
                            <Field
                                label="Address"
                                value={data.address}
                                onChange={(v) => setData("address", v)}
                            />
                            <Field
                                label="Community"
                                value={data.community}
                                onChange={(v) => setData("community", v)}
                            />
                            <Field
                                label="Location"
                                value={data.location}
                                onChange={(v) => setData("location", v)}
                            />
                            <Field
                                label="District"
                                value={data.district}
                                onChange={(v) => setData("district", v)}
                            />
                            <Field
                                label="Postal Address"
                                value={data.postal_address}
                                onChange={(v) => setData("postal_address", v)}
                            />
                        </div>
                    </Section>

                    {/* 💼 Employment */}
                    <Section title="Employment Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Workplace"
                                value={data.workplace}
                                onChange={(v) => setData("workplace", v)}
                            />
                            <Field
                                label="Profession"
                                value={data.profession}
                                onChange={(v) => setData("profession", v)}
                            />
                            <Field
                                label="Employer"
                                value={data.employer}
                                onChange={(v) => setData("employer", v)}
                            />
                            <Field
                                label="Take Home Salary (₵)"
                                type="number"
                                value={data.take_home}
                                onChange={(v) => setData("take_home", v)}
                            />
                        </div>
                    </Section>

                    {/* 🏦 Bank */}
                    <Section title="Bank Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Bank"
                                value={data.bank}
                                onChange={(v) => setData("bank", v)}
                            />
                            <Field
                                label="Bank Branch"
                                value={data.bank_branch}
                                onChange={(v) => setData("bank_branch", v)}
                            />
                            <CheckboxField
                                label="Has Existing Bank Loan?"
                                checked={data.has_bank_loan}
                                onChange={(e) =>
                                    setData("has_bank_loan", e.target.checked)
                                }
                            />
                            <Field
                                label="Bank Monthly Deduction (₵)"
                                type="number"
                                value={data.bank_monthly_deduction}
                                onChange={(v) =>
                                    setData("bank_monthly_deduction", v)
                                }
                            />
                        </div>
                    </Section>

                    {/* 💰 Loan */}
                    <Section title="Loan Request">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Loan Amount Requested (₵)"
                                type="number"
                                value={data.loan_amount_requested}
                                onChange={(v) =>
                                    setData("loan_amount_requested", v)
                                }
                            />
                            <Field
                                label="Loan Purpose"
                                value={data.loan_purpose}
                                onChange={(v) => setData("loan_purpose", v)}
                            />
                        </div>
                    </Section>

                    {/* 👥 Guarantors */}
                    <Section title="Guarantor (Optional)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Guarantor Name"
                                value={data.guarantors[0].name}
                                onChange={(v) => {
                                    const copy = [...data.guarantors];
                                    copy[0].name = v;
                                    setData("guarantors", copy);
                                }}
                            />
                            <Field
                                label="Guarantor Phone"
                                value={data.guarantors[0].contact}
                                onChange={(v) => {
                                    const copy = [...data.guarantors];
                                    copy[0].contact = v;
                                    setData("guarantors", copy);
                                }}
                            />
                        </div>
                    </Section>

                    {/* ✅ Submit */}
                    <div className="flex justify-end border-t pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
                        >
                            {processing ? "Saving..." : "Save Customer"}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .input, select {
                    width: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: .375rem;
                    padding: .5rem .75rem;
                    background: white;
                    color: #111827;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
                .animate-slideDown { animation: slideDown 0.35s ease-out; }
            `}</style>
        </AuthenticatedLayout>
    );
}

/* 🔹 Helper Components */
function Field({ label, type = "text", value, onChange, required, error }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                className="input"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

function CheckboxField({ label, checked, onChange }) {
    return (
        <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <label className="text-sm text-gray-700">{label}</label>
        </div>
    );
}

function SelectField({ label, value, onChange, options, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                className="input"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            >
                <option value="">Select...</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">
                {title}
            </h3>
            {children}
        </section>
    );
}
