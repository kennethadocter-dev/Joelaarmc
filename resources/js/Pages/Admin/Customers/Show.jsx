import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Show() {
    const { customer = {}, auth = {}, basePath = "admin" } = usePage().props;
    const c = customer || {};

    const canManage =
        ["admin", "superadmin", "staff", "officer"].includes(
            auth?.user?.role,
        ) || auth?.user?.is_super_admin;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Customer Profile
                </h2>
            }
        >
            <Head title={`${c.full_name ?? "Customer"} - Profile`} />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                    {/* 🧾 Header */}
                    <div className="flex justify-between items-center border-b pb-3">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {c.full_name || "—"}
                        </h1>
                        {canManage && (
                            <Link
                                href={route(`${basePath}.customers.edit`, c.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                ✏️ Edit
                            </Link>
                        )}
                    </div>

                    {/* 🟩 Status */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                c.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : c.status === "suspended"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {(c.status || "unknown").toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-sm">
                            Joined{" "}
                            {c.created_at
                                ? new Date(c.created_at).toLocaleDateString()
                                : "—"}
                        </span>
                    </div>

                    {/* 👤 Personal Info */}
                    <Section title="Personal Information">
                        <TwoColumn>
                            <Info label="Full Name" value={c.full_name} />
                            <Info label="Phone" value={c.phone || "—"} />
                            <Info label="Email" value={c.email || "—"} />
                            <Info
                                label="Gender"
                                value={
                                    c.gender === "M"
                                        ? "Male"
                                        : c.gender === "F"
                                          ? "Female"
                                          : "—"
                                }
                            />
                            <Info
                                label="Marital Status"
                                value={
                                    c.marital_status
                                        ? c.marital_status[0].toUpperCase() +
                                          c.marital_status.slice(1)
                                        : "—"
                                }
                            />
                        </TwoColumn>
                    </Section>

                    {/* 🏠 Address */}
                    <Section title="Address Information">
                        <TwoColumn>
                            <Info label="House No." value={c.house_no || "—"} />
                            <Info
                                label="Community"
                                value={c.community || "—"}
                            />
                            <Info label="Location" value={c.location || "—"} />
                            <Info label="District" value={c.district || "—"} />
                            <Info
                                label="Postal Address"
                                value={c.postal_address || "—"}
                            />
                        </TwoColumn>
                    </Section>

                    {/* 💼 Work & Financial */}
                    <Section title="Work & Financial Information">
                        <TwoColumn>
                            <Info
                                label="Workplace"
                                value={c.workplace || "—"}
                            />
                            <Info
                                label="Profession"
                                value={c.profession || "—"}
                            />
                            <Info label="Employer" value={c.employer || "—"} />
                            <Info label="Bank" value={c.bank || "—"} />
                            <Info
                                label="Bank Branch"
                                value={c.bank_branch || "—"}
                            />
                            <Info
                                label="Has Bank Loan"
                                value={c.has_bank_loan ? "Yes" : "No"}
                            />
                            <Info
                                label="Monthly Deduction (₵)"
                                value={c.bank_monthly_deduction || "—"}
                            />
                            <Info
                                label="Take-home Salary (₵)"
                                value={c.take_home || "—"}
                            />
                        </TwoColumn>
                    </Section>

                    {/* 💰 Loan Request */}
                    <Section title="Loan Request Information">
                        <TwoColumn>
                            <Info
                                label="Requested Amount (₵)"
                                value={c.loan_amount_requested || "—"}
                            />
                            <Info
                                label="Loan Purpose"
                                value={c.loan_purpose || "—"}
                            />
                        </TwoColumn>
                    </Section>

                    {/* 🧍‍♂️ Guarantors */}
                    <Section title="Guarantors">
                        {c.guarantors?.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {[
                                                "Name",
                                                "Occupation",
                                                "Residence",
                                                "Contact",
                                            ].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-2 text-left font-semibold text-gray-800"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {c.guarantors.map((g) => (
                                            <tr
                                                key={g.id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                <td className="px-4 py-2 text-gray-800">
                                                    {g.name}
                                                </td>
                                                <td className="px-4 py-2 text-gray-600">
                                                    {g.occupation || "—"}
                                                </td>
                                                <td className="px-4 py-2 text-gray-600">
                                                    {g.residence || "—"}
                                                </td>
                                                <td className="px-4 py-2 text-gray-600">
                                                    {g.contact || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 italic">
                                No guarantors listed.
                            </p>
                        )}
                    </Section>

                    {/* 🔙 Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <Link
                            href={route(`${basePath}.customers.index`)}
                            className="text-gray-600 hover:underline"
                        >
                            ← Back to Customers
                        </Link>

                        {canManage && (
                            <div className="flex gap-3">
                                <Link
                                    href={route(
                                        `${basePath}.customers.edit`,
                                        c.id,
                                    )}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route(`${basePath}.loans.create`, {
                                        customer_id: c.id,
                                        client_name: c.full_name,
                                    })}
                                    className={`px-4 py-2 rounded transition ${
                                        c.loans?.length >= 3
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                                    onClick={(e) => {
                                        if (c.loans?.length >= 3) {
                                            e.preventDefault();
                                            alert(
                                                "⚠️ This customer already has 3 active or pending loans.",
                                            );
                                        }
                                    }}
                                >
                                    Create Loan
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* --------------------------- 🔹 Helpers --------------------------- */
function Section({ title, children }) {
    return (
        <section className="mt-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
                {title}
            </h2>
            {children}
        </section>
    );
}

function TwoColumn({ children }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-gray-800 font-medium">{value ?? "—"}</p>
        </div>
    );
}
