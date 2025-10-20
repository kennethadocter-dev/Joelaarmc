import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Create() {
    const { basePath = "admin", flash = {} } = usePage().props;
    const [toast, setToast] = useState(flash.success || null);
    const [toastColor, setToastColor] = useState("bg-green-600");
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState(null);

    const { data, setData, processing, errors, post, reset } = useForm({
        full_name: "",
        phone: "",
        email: "",
        marital_status: "",
        gender: "",
        house_no: "",
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
        status: "inactive",
        guarantors: [{ name: "", occupation: "", residence: "", contact: "" }],
        agreement: null,
    });

    // 🧩 Add / Remove / Update Guarantor
    const addGuarantor = () =>
        setData("guarantors", [
            ...data.guarantors,
            { name: "", occupation: "", residence: "", contact: "" },
        ]);

    const removeGuarantor = (i) =>
        setData(
            "guarantors",
            data.guarantors.filter((_, idx) => idx !== i),
        );

    const updateGuarantor = (i, field, value) => {
        const updated = [...data.guarantors];
        updated[i][field] = value;
        setData("guarantors", updated);
    };

    // 📨 Submit Form
    const submit = (e) => {
        e.preventDefault();
        const fd = new FormData();

        Object.entries(data).forEach(([k, v]) => {
            if (k === "guarantors") {
                v.forEach((g, idx) => {
                    Object.entries(g).forEach(([gk, gv]) => {
                        if (gv) fd.append(`guarantors[${idx}][${gk}]`, gv);
                    });
                });
            } else if (k === "agreement" && v) {
                fd.append("agreement", v);
            } else {
                fd.append(k, v ?? "");
            }
        });

        post(route(`${basePath}.customers.store`), {
            data: fd,
            forceFormData: true,
            onSuccess: (page) => {
                const flashCustomer = page?.props?.flash?.customer;
                setToastColor("bg-green-600");
                setToast("✅ Customer created successfully!");
                setNewCustomer(flashCustomer || null);
                setShowModal(true);
                reset();
            },
            onError: (errs) => {
                setToastColor("bg-red-600");
                const first =
                    errs && Object.values(errs)?.[0]
                        ? Array.isArray(Object.values(errs)[0])
                            ? Object.values(errs)[0][0]
                            : Object.values(errs)[0]
                        : "⚠️ Please check highlighted fields.";
                setToast(first);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    New Customer
                </h2>
            }
        >
            <Head title="Create Customer" />

            {/* ✅ Toast */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-50 ${toastColor} text-white px-4 py-3 rounded-lg shadow-lg transition-opacity duration-300`}
                >
                    {toast}
                </div>
            )}

            {/* ✅ Main Form */}
            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <form
                    onSubmit={submit}
                    className="space-y-6 bg-white shadow-lg rounded-lg p-6"
                >
                    {/* PERSONAL DETAILS */}
                    <Section title="Personal Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Full Name *"
                                value={data.full_name}
                                setValue={(v) => setData("full_name", v)}
                                error={errors.full_name}
                                required
                            />
                            <Field
                                label="Phone"
                                value={data.phone}
                                setValue={(v) => setData("phone", v)}
                                error={errors.phone}
                            />
                            <Field
                                label="Email"
                                value={data.email}
                                setValue={(v) => setData("email", v)}
                                error={errors.email}
                            />
                            <Select
                                label="Marital Status"
                                value={data.marital_status}
                                setValue={(v) => setData("marital_status", v)}
                                options={[
                                    { value: "", label: "—" },
                                    { value: "single", label: "Single" },
                                    { value: "married", label: "Married" },
                                ]}
                            />
                            <Select
                                label="Gender"
                                value={data.gender}
                                setValue={(v) => setData("gender", v)}
                                options={[
                                    { value: "", label: "—" },
                                    { value: "F", label: "Female" },
                                    { value: "M", label: "Male" },
                                ]}
                            />
                            <Select
                                label="Status"
                                value={data.status}
                                setValue={(v) => setData("status", v)}
                                options={[
                                    { value: "inactive", label: "Inactive" },
                                    { value: "active", label: "Active" },
                                    { value: "suspended", label: "Suspended" },
                                ]}
                            />
                        </div>
                    </Section>

                    {/* ADDRESS */}
                    <Section title="Address">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="House No."
                                value={data.house_no}
                                setValue={(v) => setData("house_no", v)}
                            />
                            <Field
                                label="Community"
                                value={data.community}
                                setValue={(v) => setData("community", v)}
                            />
                            <Field
                                label="Location"
                                value={data.location}
                                setValue={(v) => setData("location", v)}
                            />
                            <Field
                                label="District"
                                value={data.district}
                                setValue={(v) => setData("district", v)}
                            />
                            <div className="md:col-span-2">
                                <Field
                                    label="Postal Address"
                                    value={data.postal_address}
                                    setValue={(v) =>
                                        setData("postal_address", v)
                                    }
                                />
                            </div>
                        </div>
                    </Section>

                    {/* WORK & INCOME */}
                    <Section title="Work & Income">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Workplace"
                                value={data.workplace}
                                setValue={(v) => setData("workplace", v)}
                            />
                            <Field
                                label="Profession"
                                value={data.profession}
                                setValue={(v) => setData("profession", v)}
                            />
                            <Field
                                label="Employer"
                                value={data.employer}
                                setValue={(v) => setData("employer", v)}
                            />
                            <Field
                                label="Bank"
                                value={data.bank}
                                setValue={(v) => setData("bank", v)}
                            />
                            <Field
                                label="Bank Branch"
                                value={data.bank_branch}
                                setValue={(v) => setData("bank_branch", v)}
                            />
                            <label className="inline-flex items-center gap-2 text-sm mt-6 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.has_bank_loan}
                                    onChange={(e) =>
                                        setData(
                                            "has_bank_loan",
                                            e.target.checked,
                                        )
                                    }
                                />
                                Has bank loan
                            </label>
                            <Field
                                type="number"
                                label="Bank Monthly Deduction (₵)"
                                value={data.bank_monthly_deduction}
                                setValue={(v) =>
                                    setData("bank_monthly_deduction", v)
                                }
                            />
                            <Field
                                type="number"
                                label="Take-home Salary (₵)"
                                value={data.take_home}
                                setValue={(v) => setData("take_home", v)}
                            />
                        </div>
                    </Section>

                    {/* LOAN REQUEST */}
                    <Section title="Loan Request">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                type="number"
                                label="Amount Requested (₵)"
                                value={data.loan_amount_requested}
                                setValue={(v) =>
                                    setData("loan_amount_requested", v)
                                }
                            />
                            <Field
                                label="Purpose"
                                value={data.loan_purpose}
                                setValue={(v) => setData("loan_purpose", v)}
                            />
                        </div>
                    </Section>

                    {/* GUARANTORS */}
                    <Section title="Guarantors">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                type="button"
                                onClick={addGuarantor}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-semibold transition"
                            >
                                + Add Guarantor
                            </button>
                        </div>

                        {data.guarantors.map((g, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3"
                            >
                                <input
                                    className="input"
                                    placeholder="Name *"
                                    value={g.name}
                                    onChange={(e) =>
                                        updateGuarantor(
                                            i,
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <input
                                    className="input"
                                    placeholder="Occupation"
                                    value={g.occupation}
                                    onChange={(e) =>
                                        updateGuarantor(
                                            i,
                                            "occupation",
                                            e.target.value,
                                        )
                                    }
                                />
                                <input
                                    className="input"
                                    placeholder="Residence"
                                    value={g.residence}
                                    onChange={(e) =>
                                        updateGuarantor(
                                            i,
                                            "residence",
                                            e.target.value,
                                        )
                                    }
                                />
                                <div className="flex gap-2">
                                    <input
                                        className="input flex-1"
                                        placeholder="Contact"
                                        value={g.contact}
                                        onChange={(e) =>
                                            updateGuarantor(
                                                i,
                                                "contact",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {i > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeGuarantor(i)}
                                            className="px-3 rounded border text-sm text-gray-700 border-gray-300 hover:bg-gray-100"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Section>

                    {/* AGREEMENT */}
                    <Section title="Agreement / Attachment">
                        <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={(e) =>
                                setData(
                                    "agreement",
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            className="text-gray-700"
                        />
                        {errors.agreement && (
                            <p className="error">{errors.agreement}</p>
                        )}
                    </Section>

                    {/* SUBMIT */}
                    <div className="flex justify-between items-center pt-2 border-t">
                        <Link
                            href={route(`${basePath}.customers.index`)}
                            className="text-gray-600 hover:underline"
                        >
                            ← Back
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {processing ? "Saving..." : "Save Customer"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ✅ Success Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                            🎉 Customer Created Successfully!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            What would you like to do next?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() =>
                                    (window.location.href = route(
                                        `${basePath}.loans.create`,
                                        {
                                            customer_id: newCustomer?.id,
                                            client_name: newCustomer?.full_name,
                                        },
                                    ))
                                }
                                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Create Loan
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Add Another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: .375rem;
          padding: .5rem .75rem;
          background: white;
          color: #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .error {
          color: #ef4444;
          font-size: .875rem;
          margin-top: .25rem;
        }
      `}</style>
        </AuthenticatedLayout>
    );
}

/* 🔹 Reusable Components */
function Field({ label, value, setValue, type = "text", error, required }) {
    return (
        <div>
            <label className="block text-sm text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <input
                className="input"
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required={required}
            />
            {error && <p className="error">{error}</p>}
        </div>
    );
}

function Select({ label, value, setValue, options }) {
    return (
        <div>
            <label className="block text-sm text-gray-700">{label}</label>
            <select
                className="input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section>
            <h3 className="font-semibold mb-2 text-gray-800">{title}</h3>
            {children}
        </section>
    );
}
