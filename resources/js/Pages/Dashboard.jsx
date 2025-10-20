import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import logo from "@/Images/logo.png";

const money = (n) => {
    const num = Number(n);
    return `₵${isNaN(num) ? "0.00" : num.toFixed(2)}`;
};

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function Dashboard() {
    const {
        auth,
        stats,
        recentLoans,
        recentCustomers,
        userLoans,
        userPayments,
        loanHistory,
    } = usePage().props;

    const role = auth?.user?.role ?? "user";
    const name = auth?.user?.name ?? "";
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (stats?.message) {
            setToastMessage(stats.message);
            const t = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [stats]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col items-center text-center mt-2 mb-4">
                    <img
                        src={logo}
                        alt="Joelaar Logo"
                        className="w-16 h-auto mb-1"
                    />
                    <h1 className="text-xl font-bold text-gray-800">Joelaar</h1>
                    <p className="text-sm text-gray-600">Micro-Credit</p>
                </div>
            }
        >
            <Head title="Joelaar Dashboard" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {toastMessage && (
                        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-lg">
                            {toastMessage}
                        </div>
                    )}

                    {role !== "user" && (
                        <AdminDashboard
                            stats={stats}
                            recentLoans={recentLoans}
                            recentCustomers={recentCustomers}
                            role={role}
                        />
                    )}

                    {role === "user" && (
                        <UserDashboard
                            name={name}
                            userLoans={userLoans}
                            userPayments={userPayments}
                            loanHistory={loanHistory}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ================================
   👤 USER DASHBOARD
================================ */
function UserDashboard({ name, userLoans, userPayments, loanHistory = [] }) {
    const paidPercent = userLoans?.totalLoan
        ? Math.min((userLoans.amountPaid / userLoans.totalLoan) * 100, 100)
        : 0;

    const formatDate = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        if (isNaN(d)) return "—";
        return d.toLocaleDateString();
    };

    const isWithinFiveDays = (date) => {
        if (!date) return false;
        const target = new Date(date);
        const diff = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 5;
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Welcome back, {name.split(" ")[0]} 👋
                </h2>
                <p className="text-gray-600 mt-1">
                    Here’s a quick summary of your loan account.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UserCard
                    title="Total Loan (with Interest)"
                    value={money(userLoans?.totalLoan)}
                />
                <UserCard
                    title="Amount Paid"
                    value={money(userLoans?.amountPaid)}
                    color="text-green-600"
                />
                <UserCard
                    title="Amount Left"
                    value={money(userLoans?.amountLeft)}
                    color="text-red-600"
                />
            </div>

            {/* Loan Progress */}
            {userLoans?.totalLoan > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Loan Progress
                    </h3>
                    <div className="w-full bg-gray-200 h-4 rounded-full">
                        <div
                            className="h-4 bg-blue-500 rounded-full transition-all"
                            style={{ width: `${paidPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-xs mt-2 text-gray-500">
                        {Math.round(paidPercent)}% Paid —{" "}
                        {userLoans.status?.toUpperCase()}
                    </p>
                </div>
            )}

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Payment History
                </h2>
                <ul>
                    {userPayments?.length ? (
                        userPayments.map((p) => (
                            <li
                                key={p.id}
                                className="flex justify-between py-2 border-b text-sm"
                            >
                                <span>
                                    {formatDate(p.paid_at)} - {money(p.amount)}
                                </span>
                                <span className="text-gray-500">
                                    {p.reference ?? "No Ref"}
                                </span>
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">
                            No payments recorded yet.
                        </li>
                    )}
                </ul>
            </div>

            {/* Loan History */}
            {loanHistory?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        Loan History
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {[
                                        "Loan #",
                                        "Total Paid",
                                        "Status",
                                        "Date Completed",
                                        "Last Due Date",
                                        "Next Due Payment",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-2 text-left font-semibold text-gray-700"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loanHistory.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2">
                                            #{loan.id}
                                        </td>
                                        <td className="px-4 py-2">
                                            {money(loan.amount_paid)}
                                        </td>
                                        <td className="px-4 py-2 capitalize">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    loan.status === "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : loan.status ===
                                                            "active"
                                                          ? "bg-blue-100 text-blue-700"
                                                          : loan.status ===
                                                              "overdue"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {loan.status === "paid"
                                                ? formatDate(loan.paid_at)
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {loan.status !== "paid"
                                                ? formatDate(loan.due_date)
                                                : "—"}
                                        </td>
                                        <td
                                            className={`px-4 py-2 font-medium ${
                                                isWithinFiveDays(
                                                    loan.next_due_payment,
                                                )
                                                    ? "bg-yellow-100 text-yellow-800 rounded"
                                                    : ""
                                            }`}
                                        >
                                            {loan.status !== "paid"
                                                ? formatDate(
                                                      loan.next_due_payment,
                                                  )
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ================================
   🧑‍💼 ADMIN / STAFF DASHBOARD
================================ */
function AdminDashboard({ stats, recentLoans, recentCustomers, role }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
    const [loading, setLoading] = useState(false);

    const yearOptions = Array.from(
        { length: 11 },
        (_, i) => new Date().getFullYear() - 5 + i,
    );

    const fetchYearData = async (year) => {
        setLoading(true);
        try {
            const res = await axios.get(`/admin/loans-by-year?year=${year}`);
            const payload = res.data;
            const monthTotals = Array(12).fill(0);
            for (let i = 0; i < 12; i++) {
                const key = String(i + 1).padStart(2, "0");
                monthTotals[i] = Number(payload?.[key] ?? 0);
            }
            setMonthlyData(monthTotals);
        } catch (error) {
            console.error("Error loading chart data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYearData(selectedYear);
    }, [selectedYear]);

    const kpis = [
        { label: "Total Loans", value: stats?.totalLoans ?? 0 },
        { label: "Total Customers", value: stats?.totalCustomers ?? 0 },
        { label: "Total Disbursed", value: money(stats?.totalDisbursed ?? 0) },
        {
            label: "Pending Repayment",
            value: money(stats?.pendingRepayment ?? 0),
        },
        { label: "Overdue Loans", value: stats?.overdueLoans ?? 0 },
        { label: "Interest Earned", value: money(stats?.interestEarned ?? 0) },
    ];

    return (
        <div className="space-y-8">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-6 text-center"
                    >
                        <h3 className="text-sm text-gray-500 uppercase">
                            {item.label}
                        </h3>
                        <p className="text-2xl font-semibold text-gray-800 mt-2">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Loans Issued per Month
                        </h2>
                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(Number(e.target.value))
                            }
                            className="border rounded-lg px-4 py-2 text-base text-gray-700 w-44"
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <p className="text-gray-500 text-sm">
                            Loading chart...
                        </p>
                    ) : (
                        <div className="relative h-96 w-full">
                            <Bar
                                data={{
                                    labels: MONTH_NAMES.map((m) =>
                                        m.slice(0, 3),
                                    ),
                                    datasets: [
                                        {
                                            label: `Loans in ${selectedYear}`,
                                            data: monthlyData,
                                            backgroundColor: "#3B82F6",
                                            borderRadius: 4,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        Loan Status Breakdown
                    </h2>
                    <Pie
                        data={{
                            labels: ["Active", "Pending", "Overdue", "Paid"],
                            datasets: [
                                {
                                    data: [
                                        stats?.activeLoans ?? 0,
                                        stats?.pendingLoans ?? 0,
                                        stats?.overdueLoans ?? 0,
                                        stats?.paidLoans ?? 0,
                                    ],
                                    backgroundColor: [
                                        "#3B82F6",
                                        "#F59E0B",
                                        "#EF4444",
                                        "#10B981",
                                    ],
                                },
                            ],
                        }}
                        options={{
                            plugins: {
                                legend: { labels: { color: "#6B7280" } },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/* ================================
   📋 REUSABLE COMPONENTS
================================ */
function UserCard({ title, value, color = "text-blue-600" }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-sm text-gray-500 uppercase">{title}</h3>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        </div>
    );
}
