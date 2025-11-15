import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { printSection } from "@/Utils/printSection.js";
import { useRef } from "react";

export default function Show() {
    const { customer = {}, auth = {}, flash = {} } = usePage().props;
    const user = auth?.user || {};
    const loans = customer?.loans || [];
    const guarantors = customer?.guarantors || [];

    // 🖨️ Reference to printable area
    const printRef = useRef(null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Superadmin – View Customer
                    </h2>
                    <button
                        onClick={() =>
                            printSection(
                                printRef.current,
                                `Customer Report – ${customer?.full_name || "N/A"}`,
                            )
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded shadow transition"
                    >
                        🖨️ Print Report
                    </button>
                </div>
            }
        >
            <Head title={`Customer: ${customer?.full_name || "Details"}`} />

            <div
                ref={printRef}
                className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
            >
                {/* ✅ Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded shadow">
                        {flash.error}
                    </div>
                )}

                {/* 🧍 Personal Info */}
                <section className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-6 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Personal Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p>
                            <span className="font-semibold">Full Name:</span>{" "}
                            {customer.full_name || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Phone:</span>{" "}
                            {customer.phone || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {customer.email || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Gender:</span>{" "}
                            {customer.gender || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">
                                Marital Status:
                            </span>{" "}
                            {customer.marital_status || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Status:</span>{" "}
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                    customer.status === "active"
                                        ? "bg-green-100 text-green-700 border-green-400"
                                        : customer.status === "suspended"
                                          ? "bg-red-100 text-red-700 border-red-400"
                                          : "bg-gray-200 text-gray-800 border-gray-400"
                                }`}
                            >
                                {customer.status || "—"}
                            </span>
                        </p>
                    </div>
                </section>

                {/* 🏠 Address Info */}
                <section className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-6 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Address & Location
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p>
                            <span className="font-semibold">Community:</span>{" "}
                            {customer.community || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Location:</span>{" "}
                            {customer.location || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">District:</span>{" "}
                            {customer.district || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">
                                Postal Address:
                            </span>{" "}
                            {customer.postal_address || "—"}
                        </p>
                    </div>
                </section>

                {/* 💼 Work Info */}
                <section className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-6 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Employment Details
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p>
                            <span className="font-semibold">Workplace:</span>{" "}
                            {customer.workplace || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Profession:</span>{" "}
                            {customer.profession || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Employer:</span>{" "}
                            {customer.employer || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">
                                Take-home Salary:
                            </span>{" "}
                            {customer.take_home
                                ? `₵${Number(customer.take_home).toLocaleString()}`
                                : "—"}
                        </p>
                    </div>
                </section>

                {/* 🏦 Bank Info */}
                <section className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-6 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Bank Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p>
                            <span className="font-semibold">Bank:</span>{" "}
                            {customer.bank || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Branch:</span>{" "}
                            {customer.bank_branch || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">
                                Existing Bank Loan:
                            </span>{" "}
                            {customer.has_bank_loan ? "Yes" : "No"}
                        </p>
                        <p>
                            <span className="font-semibold">
                                Monthly Deduction:
                            </span>{" "}
                            {customer.bank_monthly_deduction
                                ? `₵${Number(
                                      customer.bank_monthly_deduction,
                                  ).toLocaleString()}`
                                : "—"}
                        </p>
                    </div>
                </section>

                {/* 👥 Guarantors */}
                <section className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Guarantors
                        </h3>
                    </div>
                    <div className="p-6">
                        {guarantors.length ? (
                            <table className="min-w-full border divide-y divide-gray-200 text-sm">
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
                                    {guarantors.map((g, i) => (
                                        <tr
                                            key={i}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2">
                                                {g.name || "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {g.contact || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-600">
                                No guarantors recorded.
                            </p>
                        )}
                    </div>
                </section>

                {/* 💰 Loan History */}
                <section className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Loan History
                        </h3>
                        <Link
                            href={`/${user.role}/loans`}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View All Loans
                        </Link>
                    </div>
                    <div className="p-6">
                        {loans.length ? (
                            <table className="min-w-full border divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left">
                                            Amount
                                        </th>
                                        <th className="px-4 py-2 text-left">
                                            Status
                                        </th>
                                        <th className="px-4 py-2 text-left">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((loan, i) => (
                                        <tr
                                            key={i}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2">
                                                ₵
                                                {Number(
                                                    loan.amount,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2 capitalize">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                        loan.status === "paid"
                                                            ? "bg-green-100 text-green-700 border-green-400"
                                                            : loan.status ===
                                                                "overdue"
                                                              ? "bg-red-100 text-red-700 border-red-400"
                                                              : "bg-yellow-100 text-yellow-700 border-yellow-400"
                                                    }`}
                                                >
                                                    {loan.status}
                                                </span>
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
                        ) : (
                            <p className="text-gray-600">
                                No loans found for this customer.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
