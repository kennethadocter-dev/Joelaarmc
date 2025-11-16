import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Show() {
    const { customer = {}, auth = {}, basePath = "admin" } = usePage().props;
    const c = customer || {};

    // =============================
    // ROLE LOGIC
    // =============================
    const userRole = auth?.user?.role?.toLowerCase?.() || "";
    const canManage =
        ["admin", "staff", "superadmin"].includes(userRole) ||
        auth?.user?.is_super_admin;

    const canDelete = userRole === "admin";
    const canSuspend = userRole === "admin";

    // =============================
    // DELETE MODAL
    // =============================
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmName, setConfirmName] = useState("");

    const handleConfirmDelete = () => {
        router.delete(route(`${basePath}.customers.destroy`, c.id), {
            preserveScroll: true,
            preserveState: false,
            data: { confirm_name: confirmName },
            onSuccess: () => {
                setShowDeleteModal(false);
                setConfirmName("");
                window.toast?.success?.("Customer permanently deleted.");
            },
            onError: () => {
                window.toast?.error?.("Failed to delete customer.");
            },
        });
    };

    // =============================
    // SUSPEND / REACTIVATE MODAL
    // =============================
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [confirmSuspendName, setConfirmSuspendName] = useState("");

    const handleSuspendToggle = () => {
        router.post(
            route(`${basePath}.customers.toggleSuspend`, { customer: c.id }),
            {
                preserveScroll: true,
                preserveState: false,
                data: { confirm_name: confirmSuspendName },
                onSuccess: () => {
                    setShowSuspendModal(false);
                    setConfirmSuspendName("");
                    window.toast?.success?.("Customer status updated.");
                },
                onError: () => {
                    window.toast?.error?.("Failed to update customer status.");
                },
            },
        );
    };

    const hasActiveLoans = (c?.loans || []).some(
        (loan) => loan.status === "active" || loan.status === "overdue",
    );

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
                    {/* =============================
                        HEADER + ACTION BUTTONS
                    ============================= */}
                    <div className="flex justify-between items-center border-b pb-3">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {c.full_name || "—"}
                        </h1>

                        {canManage && c.id && (
                            <div className="flex flex-wrap gap-3">
                                {/* EDIT */}
                                <Link
                                    href={route(
                                        `${basePath}.customers.edit`,
                                        c.id,
                                    )}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                                >
                                    ✏️ Edit
                                </Link>

                                {/* CREATE LOAN */}
                                <Link
                                    href={
                                        c.status === "suspended"
                                            ? "#"
                                            : route(
                                                  `${basePath}.loans.create`,
                                                  {
                                                      customer_id: c.id,
                                                      client_name: c.full_name,
                                                      amount_requested:
                                                          c.loan_amount_requested,
                                                  },
                                              )
                                    }
                                    className={`px-4 py-2 rounded font-medium transition ${
                                        c.status === "suspended"
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                                    onClick={(e) => {
                                        if (c.status === "suspended") {
                                            e.preventDefault();
                                            alert(
                                                "⚠️ Suspended customers cannot take loans.",
                                            );
                                        }
                                    }}
                                >
                                    💰 Create Loan
                                </Link>

                                {/* SUSPEND / REACTIVATE */}
                                {canSuspend && (
                                    <button
                                        onClick={() =>
                                            setShowSuspendModal(true)
                                        }
                                        className={`px-4 py-2 rounded font-medium text-white transition ${
                                            c.status === "suspended"
                                                ? "bg-yellow-600 hover:bg-yellow-700"
                                                : "bg-orange-600 hover:bg-orange-700"
                                        }`}
                                    >
                                        {c.status === "suspended"
                                            ? "Reactivate"
                                            : "Suspend"}
                                    </button>
                                )}

                                {/* DELETE */}
                                {canDelete && (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* =============================
                        STATUS BADGE
                    ============================= */}
                    <div className="flex items-center gap-2 mt-2">
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

                    {/* =============================
                        PERSONAL INFORMATION
                    ============================= */}
                    <Section title="Personal Information">
                        <TwoColumn>
                            <Info label="Full Name" value={c.full_name} />
                            <Info label="Phone" value={c.phone} />
                            <Info label="Email" value={c.email} />
                            <Info
                                label="Gender"
                                value={
                                    c.gender === "M"
                                        ? "Male"
                                        : c.gender === "F"
                                          ? "Female"
                                          : c.gender || "—"
                                }
                            />
                            <Info
                                label="Marital Status"
                                value={
                                    c.marital_status
                                        ? c.marital_status
                                              .charAt(0)
                                              .toUpperCase() +
                                          c.marital_status.slice(1)
                                        : "—"
                                }
                            />
                        </TwoColumn>
                    </Section>

                    {/* =============================
                        ADDRESS INFORMATION
                    ============================= */}
                    <Section title="Address Information">
                        <TwoColumn>
                            <Info label="House No." value={c.house_no} />
                            <Info label="Community" value={c.community} />
                            <Info label="Location" value={c.location} />
                            <Info label="District" value={c.district} />
                            <Info
                                label="Postal Address"
                                value={c.postal_address}
                            />
                        </TwoColumn>
                    </Section>

                    {/* =============================
                        WORK & FINANCIAL INFO
                    ============================= */}
                    <Section title="Work & Financial Information">
                        <TwoColumn>
                            <Info label="Workplace" value={c.workplace} />
                            <Info label="Profession" value={c.profession} />
                            <Info label="Employer" value={c.employer} />
                            <Info label="Bank" value={c.bank} />
                            <Info label="Bank Branch" value={c.bank_branch} />
                            <Info
                                label="Has Bank Loan"
                                value={c.has_bank_loan ? "Yes" : "No"}
                            />
                            <Info
                                label="Monthly Deduction (₵)"
                                value={c.bank_monthly_deduction}
                            />
                            <Info
                                label="Take-home Salary (₵)"
                                value={c.take_home}
                            />
                        </TwoColumn>
                    </Section>

                    {/* =============================
                        REQUESTED LOAN INFO
                    ============================= */}
                    <Section title="Loan Request Information">
                        <TwoColumn>
                            <Info
                                label="Requested Amount (₵)"
                                value={c.loan_amount_requested}
                            />
                            <Info label="Loan Purpose" value={c.loan_purpose} />
                        </TwoColumn>
                    </Section>

                    {/* =============================
                        GUARANTORS
                    ============================= */}
                    <Section title="Guarantors">
                        {c.guarantors?.length ? (
                            <div className="overflow-x-auto rounded border">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">
                                                Name
                                            </th>
                                            <th className="px-4 py-2 text-left">
                                                Contact
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {c.guarantors.map((g) => (
                                            <tr
                                                key={g.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2">
                                                    {g.name}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {g.contact}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                No guarantors listed.
                            </p>
                        )}
                    </Section>

                    {/* =============================
                        LOAN HISTORY
                    ============================= */}
                    <Section title="Loan History">
                        {c.loans?.length ? (
                            <div className="overflow-x-auto rounded border">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2">Code</th>
                                            <th className="px-4 py-2">
                                                Amount
                                            </th>
                                            <th className="px-4 py-2">
                                                Status
                                            </th>
                                            <th className="px-4 py-2">
                                                Balance
                                            </th>
                                            <th className="px-4 py-2">
                                                Created
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {c.loans.map((loan) => (
                                            <tr
                                                key={loan.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2">
                                                    {loan.code || `#${loan.id}`}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {loan.amount}
                                                </td>
                                                <td className="px-4 py-2 capitalize">
                                                    {loan.status}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {loan.amount_remaining}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {new Date(
                                                        loan.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                No loans for this customer.
                            </p>
                        )}
                    </Section>
                </div>
            </div>

            {/* =============================
                DELETE MODAL
            ============================= */}
            {showDeleteModal && canDelete && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-[99999]">
                    <div className="mt-24 bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-bold text-red-600 mb-3">
                            Permanently Delete Customer
                        </h2>

                        <p className="text-gray-700 mb-3">
                            This action cannot be undone. Type the customer’s
                            full name:
                        </p>

                        <p className="font-semibold mb-1">{c.full_name}</p>

                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Type customer's name"
                            className="w-full mb-4 px-3 py-2 border rounded bg-gray-50"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmDelete}
                                disabled={
                                    confirmName.trim().toLowerCase() !==
                                    c.full_name.trim().toLowerCase()
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    confirmName.trim().toLowerCase() ===
                                    c.full_name.trim().toLowerCase()
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-red-400 cursor-not-allowed"
                                }`}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================
                SUSPEND / REACTIVATE MODAL
            ============================= */}
            {showSuspendModal && canSuspend && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-[99999]">
                    <div className="mt-24 bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-bold text-orange-600 mb-3">
                            {c.status === "suspended"
                                ? "Reactivate Customer"
                                : "Suspend Customer"}
                        </h2>

                        {hasActiveLoans && c.status !== "suspended" && (
                            <p className="text-red-600 font-semibold mb-2">
                                ⚠️ Customer has active/overdue loans. Suspending
                                may interrupt repayments.
                            </p>
                        )}

                        <p className="text-gray-700 mb-2">
                            Type this customer's full name to confirm:
                        </p>

                        <p className="font-semibold mb-2">{c.full_name}</p>

                        <input
                            type="text"
                            value={confirmSuspendName}
                            onChange={(e) =>
                                setConfirmSuspendName(e.target.value)
                            }
                            placeholder="Type customer's name"
                            className="w-full mb-4 px-3 py-2 border rounded bg-gray-50"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSuspendToggle}
                                disabled={
                                    confirmSuspendName.trim().toLowerCase() !==
                                    c.full_name.trim().toLowerCase()
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    confirmSuspendName.trim().toLowerCase() ===
                                    c.full_name.trim().toLowerCase()
                                        ? c.status === "suspended"
                                            ? "bg-yellow-600 hover:bg-yellow-700"
                                            : "bg-orange-600 hover:bg-orange-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {c.status === "suspended"
                                    ? "Reactivate"
                                    : "Suspend"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

/* Helper Components */
function Section({ title, children }) {
    return (
        <section className="mt-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">
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
