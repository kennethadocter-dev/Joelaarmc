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

    const filteredLogs = logData.filter((log) => {
        const q = query.toLowerCase();
        return (
            log.action?.toLowerCase().includes(q) ||
            log.description?.toLowerCase().includes(q) ||
            log.user?.name?.toLowerCase().includes(q) ||
            log.user?.email?.toLowerCase().includes(q)
        );
    });

    const clearLogs = () => {
        confirm(
            "Clear Activity Logs",
            "Are you sure you want to clear ALL logs? This cannot be undone.",
            () => {
                router.delete(route("superadmin.activity.clear"), {
                    preserveScroll: true,
                    onSuccess: () =>
                        window.toast?.success?.(
                            "🧹 Logs cleared successfully!",
                        ),
                    onError: () =>
                        window.toast?.error?.("❌ Failed to clear logs."),
                });
            },
            "danger",
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Activity Logs
                </h2>
            }
        >
            <Head title="Activity Logs" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full md:w-96 bg-white 
                                   dark:bg-gray-800 dark:text-gray-200"
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

                <div
                    ref={tableRef}
                    className="overflow-x-auto overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow 
                               max-h-[600px]"
                >
                    <table
                        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm 
                                      text-gray-900 dark:text-gray-100"
                    >
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
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

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredLogs.length ? (
                                filteredLogs.map((log, idx) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {idx + 1}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="font-semibold">
                                                {log.user?.name || "—"}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {log.user?.email || "—"}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-blue-700 dark:text-blue-400 font-medium">
                                            {log.action}
                                        </td>

                                        <td className="px-4 py-3">
                                            {log.description || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
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
                                        className="text-center py-6 text-gray-600 dark:text-gray-300"
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
