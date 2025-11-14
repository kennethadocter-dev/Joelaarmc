import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function SuperadminCustomersIndex() {
    const {
        customers = [],
        counts = {},
        filters = {},
        auth = {},
    } = usePage().props;
    const user = auth?.user || {};

    const [search, setSearch] = useState(filters.q || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");

    // ✅ handle search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/superadmin/customers",
            { q: search, status: selectedStatus },
            { preserveState: true, preserveScroll: true },
        );
    };

    // ✅ handle status card click
    const handleFilter = (statusKey) => {
        const newStatus =
            selectedStatus === statusKey || statusKey === "total"
                ? ""
                : statusKey;
        setSelectedStatus(newStatus);

        router.get(
            "/superadmin/customers",
            { status: newStatus, q: search },
            { preserveState: true, preserveScroll: true },
        );
    };

    const statusColors = {
        active: "bg-green-100 text-green-700 border-green-400",
        inactive: "bg-yellow-100 text-yellow-700 border-yellow-400",
        suspended: "bg-red-100 text-red-700 border-red-400",
    };

    // 🚫 Restricted Action
    const handleAddCustomer = () => {
        window.toast?.warning?.("⚠️ Superadmin cannot create customers.");
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Superadmin – Customers
                </h2>
            }
        >
            <Head title="Customers" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 🧮 Status Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(counts).map(([key, value]) => {
                        const normalizedKey = key.toLowerCase();
                        const isSelected = selectedStatus === normalizedKey;

                        return (
                            <div
                                key={key}
                                onClick={() => handleFilter(normalizedKey)}
                                className={`cursor-pointer p-4 rounded-lg text-center shadow-md transition-all duration-300 ${
                                    isSelected
                                        ? "bg-blue-700 text-white scale-105"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                }`}
                            >
                                <p className="text-sm font-semibold uppercase">
                                    {key.replace("_", " ")}
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* 🔍 Search + Add (top controls) */}
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4"
                >
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            Search
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddCustomer}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                        + Add Customer
                    </button>
                </form>

                {/* 📋 Customers Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "Name",
                                    "Phone",
                                    "Community",
                                    "Loans",
                                    "Status",
                                ].map((head) => (
                                    <th
                                        key={head}
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-800"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customers.length ? (
                                customers.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3">
                                            {c.full_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.phone || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.community || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.loans?.length || 0}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                                                    statusColors[c.status] ||
                                                    "bg-gray-100 text-gray-700 border-gray-300"
                                                }`}
                                            >
                                                {c.status
                                                    ? c.status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      c.status.slice(1)
                                                    : "Unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-6 text-gray-600"
                                    >
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
