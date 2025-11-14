import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const {
        auth,
        stats = {},
        totalExpectedInterest = 0,
        recentLoans = [],
        recentCustomers = [],
        viewType = "admin",
        refreshUrl,
    } = usePage().props;

    const user = auth?.user || {};
    const role = viewType;
    const basePath = role === "superadmin" ? "superadmin" : "admin";

    const [prevExpected, setPrevExpected] = useState(totalExpectedInterest);
    const trend =
        totalExpectedInterest > prevExpected
            ? "up"
            : totalExpectedInterest < prevExpected
              ? "down"
              : "flat";

    const trendColor =
        trend === "up"
            ? "text-green-400"
            : trend === "down"
              ? "text-red-400"
              : "text-gray-400";

    const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const COLORS = ["#3b82f6", "#22c55e", "#ef4444"];

    const [chartType, setChartType] = useState("loans");
    const [chartData, setChartData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setLoadingChart(true);
        const fetchRoute =
            role === "superadmin"
                ? "superadmin.dashboard.loansByYear"
                : "admin.dashboard.loansByYear";

        fetch(route(fetchRoute) + `?year=${selectedYear}`)
            .then((res) => res.json())
            .then((res) => {
                const data = res?.data || res;
                const formatted = Array.from({ length: 12 }, (_, i) => {
                    const k = (i + 1).toString().padStart(2, "0");
                    return {
                        month: monthNames[i],
                        loans: data[k] ?? 0,
                        customers: Math.round((data[k] ?? 0) / 1.8),
                    };
                });

                setChartData(formatted);
                setLoadingChart(false);
            })
            .catch(() => setLoadingChart(false));
    }, [selectedYear]);

    useEffect(() => {
        setPrevExpected((p) => (p === 0 ? totalExpectedInterest : p));
    }, [totalExpectedInterest]);

    const years = [];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear; y >= thisYear - 5; y--) years.push(y);

    const getTicks = (dataKey) => {
        const max = Math.max(...chartData.map((d) => d[dataKey] || 0));
        const step = Math.max(1, Math.ceil(max / 6));
        const ticks = [];
        for (let i = 0; i <= max + step; i += step) ticks.push(i);
        return ticks.length ? ticks : [0, 1];
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {role === "superadmin"
                        ? "Superadmin Dashboard"
                        : "Admin Dashboard"}
                </h2>
            }
        >
            <Head
                title={`${role === "superadmin" ? "Superadmin" : "Admin"} Dashboard`}
            />

            <div className="py-6 max-w-7xl mx-auto space-y-10">
                {/* ===== Summary Cards ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <SummaryCard label="Total Loans" value={stats.totalLoans} />
                    <SummaryCard
                        label="Total Customers"
                        value={stats.totalCustomers}
                    />
                    <SummaryCard
                        label="Total Disbursed"
                        value={`₵${(stats.totalDisbursed ?? 0).toLocaleString()}`}
                    />
                    <SummaryCard
                        label="Pending Payment"
                        value={`₵${(stats.pendingRepayment ?? 0).toLocaleString()}`}
                    />
                    <SummaryCard
                        label="Expected Interest"
                        value={`₵${(totalExpectedInterest || 0).toLocaleString()}`}
                        trendColor={trendColor}
                        trendSymbol={trendSymbol}
                        link={route(`${basePath}.dashboard.expectedInterest`)}
                    />
                    <SummaryCard
                        label="Interest Earned"
                        value={`₵${(stats.interestEarned ?? 0).toLocaleString()}`}
                    />
                </div>

                {/* ===== Charts ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard
                        title={`Loans per Month (${selectedYear})`}
                        chartData={chartData}
                        chartType={chartType}
                        setChartType={setChartType}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        loadingChart={loadingChart}
                        years={years}
                        getTicks={getTicks}
                    />

                    <PieCard stats={stats} COLORS={COLORS} />
                </div>

                {/* ===== Recent Lists ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RecentList
                        title="Recent Loans"
                        items={recentLoans.map((l) => ({
                            label: l.client_name,
                            value: `₵${l.amount.toLocaleString()}`,
                        }))}
                    />

                    <RecentList
                        title="Recent Customers"
                        items={recentCustomers.map((c) => ({
                            label: `${c.full_name ?? "Unnamed"} (${c.phone ?? "No phone"})`,
                            value: `₵${(c.loans_sum_amount ?? 0).toLocaleString()}`,
                        }))}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ---------------- COMPONENTS ---------------- */

function SummaryCard({ label, value, link, trendColor, trendSymbol }) {
    const content = (
        <>
            <h3 className="text-sm font-semibold uppercase tracking-wide">
                {label}
            </h3>
            <p className="text-2xl font-bold mt-2 flex items-center gap-2">
                {value}
                {trendSymbol && (
                    <span className={`${trendColor} text-sm font-semibold`}>
                        {trendSymbol}
                    </span>
                )}
            </p>
        </>
    );

    return link ? (
        <Link
            href={link}
            className="rounded-xl shadow-md p-6 border border-gray-800 bg-gray-900 hover:shadow-lg transition text-white w-full text-left"
        >
            {content}
        </Link>
    ) : (
        <div className="rounded-xl shadow-md p-6 border border-gray-800 bg-gray-900 text-white">
            {content}
        </div>
    );
}

function ChartCard({
    title,
    chartData,
    chartType,
    setChartType,
    selectedYear,
    setSelectedYear,
    loadingChart,
    years,
    getTicks,
}) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {title}
                </h3>

                <div className="flex items-center gap-4">
                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                        }
                        className="border border-gray-400 rounded-lg px-4 py-1.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 w-36"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>

                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="border border-gray-400 rounded-lg px-4 py-1.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 w-40"
                    >
                        <option value="loans">Loans</option>
                        <option value="customers">Customers</option>
                    </select>
                </div>
            </div>

            {/* FIXED HEIGHT CONTAINER */}
            <div className="w-full h-72 min-h-[280px]">
                {loadingChart ? (
                    <p className="text-gray-500">Loading chart...</p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="month" />
                            <YAxis
                                ticks={getTicks(chartType)}
                                allowDecimals={false}
                            />
                            <Tooltip />
                            <Bar
                                dataKey={chartType}
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

function PieCard({ stats, COLORS }) {
    const loanPie = [
        { name: "Paid Loans", value: stats.paidLoans ?? 0 },
        { name: "Active Loans", value: stats.activeLoans ?? 0 },
        { name: "Overdue Loans", value: stats.overdueLoans ?? 0 },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Loan Status Overview
            </h3>

            {/* FIXED HEIGHT CONTAINER */}
            <div className="w-full h-72 min-h-[280px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={loanPie}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label
                        >
                            {loanPie.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function RecentList({ title, items }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {title}
            </h3>

            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {items.length ? (
                    items.map((item, i) => (
                        <li
                            key={i}
                            className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"
                        >
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                        </li>
                    ))
                ) : (
                    <p>No {title.toLowerCase()} found.</p>
                )}
            </ul>
        </div>
    );
}
