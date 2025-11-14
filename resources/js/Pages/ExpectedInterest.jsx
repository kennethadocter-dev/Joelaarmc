import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function ExpectedInterest() {
    const { auth, loans = [], totalExpected = 0 } = usePage().props;

    const role = auth?.user?.role?.toLowerCase?.() || "admin";
    const backRoute =
        role === "superadmin"
            ? route("superadmin.dashboard")
            : route("admin.dashboard");

    const money = (n) => `₵${Number(n ?? 0).toFixed(2)}`;
    const formatDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
              })
            : "—";

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Expected Interest
                </h2>
            }
        >
            <Head title="Expected Interest" />

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                {/* SUMMARY CARD */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Total Expected Interest
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Interest projected from unpaid active loans.
                        </p>
                    </div>
                    <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                        {money(totalExpected)}
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-900">
                            <tr>
                                {[
                                    "Loan ID",
                                    "Client",
                                    "Principal (₵)",
                                    "Interest Rate (%)",
                                    "Expected Interest (₵)",
                                    "Status",
                                    "Created At",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loans.length ? (
                                loans.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                            #{loan.id}
                                        </td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                            {loan.client_name ?? "—"}
                                        </td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                            {money(loan.amount ?? 0)}
                                        </td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                            {loan.interest_rate
                                                ? `${loan.interest_rate}%`
                                                : "20%"}
                                        </td>
                                        <td className="px-4 py-2 font-semibold text-indigo-700 dark:text-indigo-400">
                                            {money(
                                                loan.interest ??
                                                    loan.expected_interest ??
                                                    0,
                                            )}
                                        </td>
                                        <td className="px-4 py-2 capitalize">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    loan.status?.toLowerCase() ===
                                                    "active"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                        : loan.status?.toLowerCase() ===
                                                            "overdue"
                                                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                }`}
                                            >
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                            {formatDate(loan.created_at)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-6 text-gray-600 dark:text-gray-300"
                                    >
                                        No expected interest data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER TOTAL */}
                {loans.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-medium mr-2">
                            Total Expected Interest:
                        </span>
                        <span className="text-indigo-700 dark:text-indigo-400 font-bold">
                            {money(totalExpected)}
                        </span>
                    </div>
                )}

                {/* BACK BUTTON */}
                <div className="text-center">
                    <Link
                        href={backRoute}
                        className="inline-block mt-4 px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded hover:bg-black dark:hover:bg-gray-900 transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
