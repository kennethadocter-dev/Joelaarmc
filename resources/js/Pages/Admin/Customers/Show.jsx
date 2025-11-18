import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Show() {
    const {
        customer = {},
        auth = {},
        basePath = "admin",
        flash = {},
    } = usePage().props;

    const c = customer || {};

    /* =============================================
       GLOBAL TOAST (FLASH MESSAGES)
    ============================================= */
    useEffect(() => {
        if (flash?.success) window.toast?.success?.(flash.success);
        if (flash?.error) window.toast?.error?.(flash.error);
    }, [flash]);

    /* =============================================
       ROLE LOGIC
    ============================================= */
    const userRole = auth?.user?.role?.toLowerCase?.() || "";
    const isSuper = auth?.user?.is_super_admin;

    const canManage =
        ["admin", "staff", "superadmin"].includes(userRole) || isSuper;
    const canDelete = userRole === "admin";
    const canSuspend = userRole === "admin" || isSuper;

    /* =============================================
       SMALL HELPERS
    ============================================= */
    const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;

    const safeDate = (d) => (d ? new Date(d).toLocaleDateString("en-US") : "—");

    const hasActiveLoans = (c?.loans || []).some(
        (loan) => loan.status === "active" || loan.status === "overdue",
    );

    /* =============================================
       DELETE MODAL
    ============================================= */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmName, setConfirmName] = useState("");

    const handleConfirmDelete = () => {
        router.delete(route(`${basePath}.customers.destroy`, c.id), {
            preserveScroll: true,
            data: { confirm_name: confirmName },
            onSuccess: () => {
                window.toast?.success?.("Customer permanently deleted.");
            },
            onError: () => window.toast?.error?.("Failed to delete customer."),
        });
    };

    /* =============================================
       SUSPEND / REACTIVATE
    ============================================= */
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [confirmSuspendName, setConfirmSuspendName] = useState("");

    const handleSuspendToggle = () => {
        router.post(route(`${basePath}.customers.toggleSuspend`, c.id), {
            preserveScroll: true,
            data: { confirm_name: confirmSuspendName },
            onSuccess: () => {
                window.toast?.success?.("Customer status updated.");
                router.reload();
            },
            onError: () =>
                window.toast?.error?.("Failed to update customer status."),
        });
    };

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
                    {/* ======================
                        HEADER + ACTION BUTTONS
                    ====================== */}
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                                    className={`px-4 py-2 rounded transition ${
                                        c.status === "suspended"
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                                    onClick={(e) => {
                                        if (c.status === "suspended") {
                                            e.preventDefault();
                                            window.toast?.error?.(
                                                "Suspended customers cannot take loans.",
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
                                        className={`px-4 py-2 rounded text-white transition ${
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
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ======================
                        STATUS BADGE
                    ====================== */}
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
                            Joined {safeDate(c.created_at)}
                        </span>
                    </div>

                    {/* ======================
                        PERSONAL INFORMATION
                    ====================== */}
                    <Section title="Personal Information">
                        <TwoColumn>
                            <Info label="Full Name" value={c.full_name} />
                            <Info label="Phone" value={c.phone} />
                            <Info label="Email" value={c.email} />
                            <Info label="Gender" value={c.gender} />
                            <Info
                                label="Marital Status"
                                value={c.marital_status}
                            />
                        </TwoColumn>
                    </Section>

                    {/* ======================
                        ADDRESS
                    ====================== */}
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

                    {/* ======================
                        FINANCIAL INFO
                    ====================== */}
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
                                label="Monthly Deduction"
                                value={money(c.bank_monthly_deduction)}
                            />
                            <Info
                                label="Take-home Salary"
                                value={money(c.take_home)}
                            />
                        </TwoColumn>
                    </Section>

                    {/* ======================
                        LOAN REQUEST
                    ====================== */}
                    <Section title="Loan Request Information">
                        <TwoColumn>
                            <Info
                                label="Requested Amount"
                                value={money(c.loan_amount_requested)}
                            />
                            <Info label="Loan Purpose" value={c.loan_purpose} />
                        </TwoColumn>
                    </Section>

                    {/* ======================
                        GUARANTORS
                    ====================== */}
                    <Section title="Guarantors">
                        {c.guarantors?.length ? (
                            <div className="overflow-x-auto border rounded">
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

                    {/* ======================
                        LOAN HISTORY
                    ====================== */}
                    <Section title="Loan History">
                        {c.loans?.length ? (
                            <div className="overflow-x-auto border rounded">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2">
                                                Loan Code
                                            </th>
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
                                                    {loan.loan_code ||
                                                        `#${loan.id}`}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {money(loan.amount)}
                                                </td>
                                                <td className="px-4 py-2 capitalize">
                                                    {loan.status}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {money(
                                                        loan.amount_remaining,
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {safeDate(loan.created_at)}
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
                <DeleteModal
                    name={c.full_name}
                    confirmName={confirmName}
                    setConfirmName={setConfirmName}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}

            {/* =============================
                SUSPEND/REACTIVATE MODAL
            ============================= */}
            {showSuspendModal && canSuspend && (
                <SuspendModal
                    name={c.full_name}
                    isSuspended={c.status === "suspended"}
                    hasActiveLoans={hasActiveLoans}
                    confirmName={confirmSuspendName}
                    setConfirmName={setConfirmSuspendName}
                    onClose={() => setShowSuspendModal(false)}
                    onConfirm={handleSuspendToggle}
                />
            )}
        </AuthenticatedLayout>
    );
}

/* ============================================
   COMPONENTS
============================================ */
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

/* ============================================
   DELETE MODAL
============================================ */
function DeleteModal({
    name,
    confirmName,
    setConfirmName,
    onClose,
    onConfirm,
}) {
    const match =
        confirmName.trim().toLowerCase() === name.trim().toLowerCase();

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-[99999]">
            <div className="mt-24 bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
                <h2 className="text-lg font-bold text-red-600 mb-3">
                    Permanently Delete Customer
                </h2>

                <p className="text-gray-700 mb-3">
                    This action cannot be undone. Type the customer’s full name:
                </p>

                <p className="font-semibold mb-1">{name}</p>

                <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Type customer's name"
                    className="w-full mb-4 px-3 py-2 border rounded bg-gray-50"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={!match}
                        className={`px-4 py-2 rounded text-white ${
                            match
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-red-400 cursor-not-allowed"
                        }`}
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ============================================
   SUSPEND / REACTIVATE MODAL
============================================ */
function SuspendModal({
    name,
    isSuspended,
    hasActiveLoans,
    confirmName,
    setConfirmName,
    onClose,
    onConfirm,
}) {
    const match =
        confirmName.trim().toLowerCase() === name.trim().toLowerCase();

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-[99999]">
            <div className="mt-24 bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
                <h2 className="text-lg font-bold text-orange-600 mb-3">
                    {isSuspended ? "Reactivate Customer" : "Suspend Customer"}
                </h2>

                {/* ⚠ ACTIVE LOAN WARNING */}
                {hasActiveLoans && !isSuspended && (
                    <p className="text-red-600 font-semibold mb-2">
                        ⚠ This customer has active/overdue loans.
                    </p>
                )}

                <p className="text-gray-700 mb-2">
                    Type this customer's full name to confirm:
                </p>

                <p className="font-semibold mb-2">{name}</p>

                <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Type customer's name"
                    className="w-full mb-4 px-3 py-2 border rounded bg-gray-50"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={!match}
                        className={`px-4 py-2 rounded text-white ${
                            match
                                ? isSuspended
                                    ? "bg-yellow-600 hover:bg-yellow-700"
                                    : "bg-orange-600 hover:bg-orange-700"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {isSuspended ? "Reactivate" : "Suspend"}
                    </button>
                </div>
            </div>
        </div>
    );
}
