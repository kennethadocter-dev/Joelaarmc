import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import { printSection } from "@/utils/printSection";

export default function ActivityLogsIndex() {
    const { logs } = usePage().props;
    const logData = logs?.data || [];
    const [query, setQuery] = useState("");
    const tableRef = useRef(null);
    const confirm = useConfirm();

    // 🔍 Client-side filter
    const filteredLogs = logData.filter((log) => {
        const q = query.toLowerCase();
        return (
            log.action?.toLowerCase().includes(q) ||
            log.description?.toLowerCase().includes(q) ||
            log.user?.name?.toLowerCase().includes(q) ||
            log.user?.email?.toLowerCase().includes(q)
        );
    });

    // 🧹 Clear logs
    const clearLogs = () => {
        confirm(
            "Clear Activity Logs",
            "Are you sure you want to clear all logs? This action cannot be undone.",
            () => {
                router.delete(route("activity.clear"), {
                    preserveScroll: true,
                    onSuccess: () => {
                        window.toast?.success?.(
                            "🧹 All logs cleared successfully!",
                        );
                    },
                    onError: () => {
                        window.toast?.error?.("❌ Failed to clear logs.");
                    },
                });
            },
            "danger",
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Activity Logs
                </h2>
            }
        >
            <Head title="Activity Logs" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 🔍 Search / Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full md:w-96 bg-white text-gray-900"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => printSection(tableRef.current)}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition"
                        >
                            🖨️ Print Logs
                        </button>
                        <button
                            onClick={clearLogs}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                            🧹 Clear Logs
                        </button>
                    </div>
                </div>

                {/* 🧾 Logs Table */}
                <div
                    ref={tableRef}
                    className="overflow-x-auto overflow-y-auto bg-white rounded-lg shadow max-h-[600px]"
                >
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {[
                                    "#",
                                    "User",
                                    "Action",
                                    "Description",
                                    "Date",
                                ].map((head) => (
                                    <th
                                        key={head}
                                        className="px-4 py-3 text-left text-sm font-semibold"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log, idx) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-gray-600">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">
                                                {log.user?.name || "—"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {log.user?.email || "—"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-blue-700 font-medium">
                                            {log.action}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {log.description || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-6 text-gray-600"
                                    >
                                        No activity logs found.
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
