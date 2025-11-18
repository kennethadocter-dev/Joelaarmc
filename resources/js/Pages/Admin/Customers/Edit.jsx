import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Edit() {
    const { customer = {}, basePath = "admin", flash = {} } = usePage().props;

    // REPLACE YOUR CUSTOM TOAST WITH GLOBAL REACT-HOT-TOAST
    useEffect(() => {
        if (flash?.success) window.toast?.success(flash.success);
        if (flash?.error) window.toast?.error(flash.error);
    }, [flash]);

    /** -----------------------------------------
     *  SAFE INITIAL DATA
     * ----------------------------------------- */
    const { data, setData, put, processing, errors } = useForm({
        full_name: customer.full_name ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        marital_status: customer.marital_status ?? "",
        gender: customer.gender ?? "",
        house_no: customer.house_no ?? "",
        address: customer.address ?? "",
        community: customer.community ?? "",
        location: customer.location ?? "",
        district: customer.district ?? "",
        postal_address: customer.postal_address ?? "",
        workplace: customer.workplace ?? "",
        profession: customer.profession ?? "",
        employer: customer.employer ?? "",
        bank: customer.bank ?? "",
        bank_branch: customer.bank_branch ?? "",
        has_bank_loan: !!customer.has_bank_loan,
        bank_monthly_deduction: customer.bank_monthly_deduction ?? "",
        take_home: customer.take_home ?? "",
        loan_amount_requested: customer.loan_amount_requested ?? "",
        loan_purpose: customer.loan_purpose ?? "",
        status: customer.status ?? "inactive",

        // GUARANTORS SAFE → no rerenders
        guarantors:
            customer.guarantors?.length > 0
                ? customer.guarantors.map((g) => ({
                      id: g.id ?? null,
                      name: g.name ?? "",
                      occupation: g.occupation ?? "",
                      residence: g.residence ?? "",
                      contact: g.contact ?? "",
                  }))
                : [{ name: "", occupation: "", residence: "", contact: "" }],
    });

    /** -----------------------------------------
     *  GUARANTOR HANDLERS (FAST & NO LAG)
     * ----------------------------------------- */
    const updateGuarantor = (index, field, value) => {
        const updated = [...data.guarantors];
        updated[index][field] = value;
        setData("guarantors", updated);
    };

    const addGuarantor = () =>
        setData("guarantors", [
            ...data.guarantors,
            { name: "", occupation: "", residence: "", contact: "" },
        ]);

    const removeGuarantor = (i) =>
        setData(
            "guarantors",
            data.guarantors.filter((_, index) => index !== i),
        );

    /** -----------------------------------------
     *  SUBMIT UPDATE (CORRECTED)
     * ----------------------------------------- */
    const handleSubmit = (e) => {
        e.preventDefault();

        put(
            route(`${basePath}.customers.update`, customer.id),
            data, // <-- CORRECT ARG 2
            {
                preserveScroll: true,
                onSuccess: () => {
                    window.toast?.success("Customer updated successfully!");
                },
                onError: (errs) => {
                    window.toast?.error(
                        Object.values(errs)[0] || "Failed to update customer.",
                    );
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Edit Customer
                </h2>
            }
        >
            <Head title={`Edit ${customer.full_name ?? "Customer"}`} />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">
                        ✏️ Edit Customer Details
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* PERSONAL INFO */}
                        <Section title="Personal Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field
                                    label="Full Name"
                                    value={data.full_name}
                                    onChange={(v) => setData("full_name", v)}
                                    error={errors.full_name}
                                    required
                                />

                                <Field
                                    label="Phone"
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
                                    onChange={(v) =>
                                        setData("marital_status", v)
                                    }
                                    options={[
                                        { value: "", label: "Select" },
                                        { value: "single", label: "Single" },
                                        { value: "married", label: "Married" },
                                    ]}
                                />

                                <SelectField
                                    label="Gender"
                                    value={data.gender}
                                    onChange={(v) => setData("gender", v)}
                                    options={[
                                        { value: "", label: "Select" },
                                        { value: "M", label: "Male" },
                                        { value: "F", label: "Female" },
                                    ]}
                                />

                                <SelectField
                                    label="Status"
                                    value={data.status}
                                    onChange={(v) => setData("status", v)}
                                    options={[
                                        { value: "active", label: "Active" },
                                        {
                                            value: "inactive",
                                            label: "Inactive",
                                        },
                                        {
                                            value: "suspended",
                                            label: "Suspended",
                                        },
                                    ]}
                                />
                            </div>
                        </Section>

                        {/* ADDRESS */}
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
                                    label="Location (Town/City)"
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
                                    onChange={(v) =>
                                        setData("postal_address", v)
                                    }
                                />
                            </div>
                        </Section>

                        {/* WORK */}
                        <Section title="Work & Income">
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
                                    label="Has Bank Loan"
                                    checked={data.has_bank_loan}
                                    onChange={(v) =>
                                        setData("has_bank_loan", v)
                                    }
                                />
                                <Field
                                    type="number"
                                    label="Bank Monthly Deduction (₵)"
                                    value={data.bank_monthly_deduction}
                                    onChange={(v) =>
                                        setData("bank_monthly_deduction", v)
                                    }
                                />
                                <Field
                                    type="number"
                                    label="Take Home (₵)"
                                    value={data.take_home}
                                    onChange={(v) => setData("take_home", v)}
                                />
                            </div>
                        </Section>

                        {/* LOAN REQUEST */}
                        <Section title="Loan Request Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field
                                    type="number"
                                    label="Loan Amount Requested (₵)"
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

                        {/* GUARANTORS */}
                        <Section title="Guarantors">
                            <div className="flex justify-between mb-3">
                                <h3 className="text-gray-800 font-semibold">
                                    Edit Guarantors
                                </h3>
                                <button
                                    type="button"
                                    onClick={addGuarantor}
                                    className="text-blue-600 hover:underline"
                                >
                                    + Add Guarantor
                                </button>
                            </div>

                            {data.guarantors.map((g, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 border-b pb-3"
                                >
                                    <input
                                        className="border rounded p-2"
                                        value={g.name}
                                        placeholder="Name"
                                        onChange={(e) =>
                                            updateGuarantor(
                                                idx,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="border rounded p-2"
                                        value={g.occupation}
                                        placeholder="Occupation"
                                        onChange={(e) =>
                                            updateGuarantor(
                                                idx,
                                                "occupation",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="border rounded p-2"
                                        value={g.residence}
                                        placeholder="Residence"
                                        onChange={(e) =>
                                            updateGuarantor(
                                                idx,
                                                "residence",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            className="border rounded p-2 w-full"
                                            value={g.contact}
                                            placeholder="Contact"
                                            onChange={(e) =>
                                                updateGuarantor(
                                                    idx,
                                                    "contact",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeGuarantor(idx)
                                                }
                                                className="px-3 py-1 border rounded text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Section>

                        {/* SUBMIT */}
                        <div className="flex justify-between pt-4 border-t">
                            <Link
                                href={route(`${basePath}.customers.index`)}
                                className="text-gray-600 hover:underline"
                            >
                                ← Back to Customers
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                            >
                                {processing ? "Saving..." : "Update Customer"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* REUSABLE COMPONENTS */
function Section({ title, children }) {
    return (
        <section className="mt-4">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            {children}
        </section>
    );
}

function Field({ label, value, onChange, type = "text", error, required }) {
    return (
        <div>
            <label className="block text-sm text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="border rounded w-full p-2"
            />
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm text-gray-700">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded w-full p-2"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function CheckboxField({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2 mt-6">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-5 w-5 text-blue-600"
            />
            <span className="text-sm">{label}</span>
        </label>
    );
}
