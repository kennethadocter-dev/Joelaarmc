// ✅ Imports
import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Main Component
export default function SystemIndex() {
    const {
        stats = {},
        backups = [],
        basePath = "superadmin",
    } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        ⚙️ System Control Panel
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage backups, restore data, and perform system
                        maintenance
                    </p>
                </div>
            }
        >
            <SystemControlInner
                stats={stats}
                backups={backups}
                basePath={basePath}
            />
        </AuthenticatedLayout>
    );
}

// ===================================================================
// ✅ Inner Functional Component
// ===================================================================
function SystemControlInner({ stats, backups, basePath }) {
    const confirm = useConfirm();
    const [loading, setLoading] = useState(false);
    const [localBackups, setLocalBackups] = useState(backups || []);
    const [resetMode, setResetMode] = useState("superadmin_only");
    const [selectedBackup, setSelectedBackup] = useState("");
    const [uploadFile, setUploadFile] = useState(null);

    // 🔁 Refresh Backups
    const refreshBackups = async () => {
        try {
            const res = await axios.get(
                route(`${basePath}.system.listBackups`),
            );
            setLocalBackups(res.data.backups || []);
            window.toast?.success?.("🔄 Backup list refreshed!");
        } catch {
            window.toast?.error?.("❌ Failed to refresh backups.");
        }
    };

    // 💾 Create Backup
    const handleBackup = () => {
        confirm(
            "Create Backup",
            "Are you sure you want to create a new database backup?",
            async () => {
                try {
                    setLoading(true);
                    const res = await axios.post(
                        route(`${basePath}.system.backup`),
                    );
                    setLocalBackups(res.data.backups || []);
                    window.toast?.success?.(
                        res.data.message || "✅ Backup created successfully!",
                    );
                } catch {
                    window.toast?.error?.("❌ Backup failed.");
                } finally {
                    setLoading(false);
                }
            },
            "info",
        );
    };

    // ♻️ Restore Backup
    const handleRestore = () => {
        if (!selectedBackup) {
            return window.toast?.error?.(
                "⚠️ Please select a backup file first.",
            );
        }

        confirm(
            "Restore Backup",
            `Restore from "${selectedBackup}"? This will overwrite all data.`,
            async () => {
                try {
                    setLoading(true);
                    const res = await axios.post(
                        route(`${basePath}.system.restore`),
                        { file: selectedBackup },
                    );
                    window.toast?.success?.(
                        res.data.message || "✅ Backup restored successfully!",
                    );
                } catch {
                    window.toast?.error?.("❌ Restore failed.");
                } finally {
                    setLoading(false);
                }
            },
            "warning",
        );
    };

    // 📤 Upload Backup
    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) setUploadFile(file);
    };

    const submitUpload = async () => {
        if (!uploadFile) {
            return window.toast?.error?.("⚠️ Please choose a file first.");
        }

        const formData = new FormData();
        formData.append("backup_file", uploadFile);

        try {
            setLoading(true);
            const res = await axios.post(
                route(`${basePath}.system.upload`),
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            setLocalBackups(res.data.backups || []);
            window.toast?.success?.(
                res.data.message || "✅ Backup uploaded successfully!",
            );
            setUploadFile(null);
        } catch {
            window.toast?.error?.("❌ Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    // 🔁 Recalculate Loans
    const handleRecalculate = () => {
        confirm(
            "Recalculate Loans",
            "Recalculate all loans and schedules?",
            async () => {
                try {
                    setLoading(true);
                    const res = await axios.post(
                        route(`${basePath}.system.recalculateLoans`),
                    );
                    window.toast?.success?.(
                        res.data.message || "✅ Loan recalculation complete!",
                    );
                } catch {
                    window.toast?.error?.("❌ Recalculation failed.");
                } finally {
                    setLoading(false);
                }
            },
            "info",
        );
    };

    // 🧨 Reset System
    const handleReset = () => {
        confirm(
            "System Reset",
            `This will delete most data and keep: ${resetMode
                .replaceAll("_", " ")
                .toUpperCase()}.`,
            async () => {
                try {
                    setLoading(true);
                    const res = await axios.post(
                        route(`${basePath}.system.reset`),
                        { keep: resetMode },
                    );
                    window.toast?.success?.(
                        res.data.message || "✅ System reset complete!",
                    );
                } catch {
                    window.toast?.error?.("❌ Reset failed.");
                } finally {
                    setLoading(false);
                }
            },
            "danger",
        );
    };

    // 🗑️ Delete Backup
    const handleDeleteBackup = (file) => {
        confirm(
            "Delete Backup",
            `Are you sure you want to delete "${file}"?`,
            async () => {
                try {
                    setLoading(true);
                    await axios.post(
                        route(`${basePath}.system.deleteBackup`),
                        { file },
                        { headers: { "X-HTTP-Method-Override": "DELETE" } },
                    );

                    setLocalBackups((prev) =>
                        prev.filter((b) => b.file !== file),
                    );

                    window.toast?.success?.("🗑️ Backup deleted successfully.");
                } catch {
                    window.toast?.error?.("❌ Delete failed.");
                } finally {
                    setLoading(false);
                }
            },
            "danger",
        );
    };

    // ===================================================================
    // UI
    // ===================================================================
    return (
        <>
            <Head title="System Control" />
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 text-gray-800 dark:text-gray-100">
                {/* ====================== 📊 Overview ====================== */}
                <section>
                    <h3 className="text-lg font-semibold mb-4">
                        📈 System Overview
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(stats).map(([key, val]) => (
                            <div
                                key={key}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center"
                            >
                                <h4 className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {key.replace("_", " ")}
                                </h4>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                                    {val ?? "—"}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* =================== 💰 Loan & Reset =================== */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Loan Maintenance */}
                    <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-3">
                            💰 Loan Maintenance
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Recalculate loan totals, interests, and payment
                            statuses.
                        </p>

                        <button
                            onClick={handleRecalculate}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                        >
                            🔁 Recalculate All Loans
                        </button>
                    </div>

                    {/* Reset System */}
                    <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            🧨 Reset System
                        </h3>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <select
                                value={resetMode}
                                onChange={(e) => setResetMode(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900"
                            >
                                <option value="superadmin_only">
                                    Keep Superadmin Only
                                </option>
                                <option value="admins_and_superadmin">
                                    Keep Admins + Superadmin
                                </option>
                                <option value="keep_all_staff">
                                    Keep All Staff
                                </option>
                            </select>

                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                            >
                                🧨 Execute System Reset
                            </button>
                        </div>
                    </div>
                </section>

                {/* ====================== 💾 Backup Management ====================== */}
                <section className="bg-white dark:bg-gray-800 border rounded-xl shadow-md p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 gap-3">
                        <h3 className="text-lg font-semibold">
                            📦 Backup Management
                        </h3>

                        <div className="flex gap-2">
                            <button
                                onClick={refreshBackups}
                                disabled={loading}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                            >
                                🔄 Refresh
                            </button>

                            <button
                                onClick={handleBackup}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                            >
                                💾 Create Backup
                            </button>
                        </div>
                    </div>

                    {/* Upload + Restore */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end mb-6">
                        {/* Restore */}
                        <div className="flex flex-col flex-1">
                            <label className="text-sm mb-1">
                                Select backup to restore
                            </label>
                            <select
                                value={selectedBackup}
                                onChange={(e) =>
                                    setSelectedBackup(e.target.value)
                                }
                                className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900"
                            >
                                <option value="">
                                    -- Choose a backup file --
                                </option>

                                {localBackups.map((b, i) => (
                                    <option key={i} value={b.file}>
                                        {b.file} ({b.size})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Upload */}
                        <div className="flex flex-col flex-1">
                            <label className="text-sm mb-1">
                                Upload backup (.sql/.zip/.sqlite)
                            </label>

                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".zip,.sql,.sqlite"
                                    onChange={handleUpload}
                                    className="text-sm flex-1 border rounded-md px-2 py-2 bg-white dark:bg-gray-900"
                                />

                                <button
                                    onClick={submitUpload}
                                    disabled={loading || !uploadFile}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                >
                                    📤 Upload
                                </button>
                            </div>
                        </div>

                        {/* Restore Button */}
                        <button
                            onClick={handleRestore}
                            disabled={loading}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-md disabled:opacity-50"
                        >
                            ♻️ Restore
                        </button>
                    </div>

                    {/* List Backups */}
                    <AnimatePresence>
                        {localBackups.length > 0 ? (
                            localBackups.map((b) => (
                                <motion.li
                                    key={b.file}
                                    initial={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex justify-between items-center py-2 text-sm border-t dark:border-gray-700"
                                >
                                    <div>
                                        <span className="font-medium">
                                            {b.file}
                                        </span>
                                        <span className="text-gray-500 ml-2">
                                            {b.size} — {b.date}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleDeleteBackup(b.file)
                                        }
                                        className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                        Delete
                                    </button>
                                </motion.li>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No backups yet.
                            </p>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </>
    );
}
