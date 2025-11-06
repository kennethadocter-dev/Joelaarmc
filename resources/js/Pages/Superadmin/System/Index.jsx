import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    FaDatabase,
    FaRedo,
    FaTrashAlt,
    FaHdd,
    FaCheckCircle,
    FaExclamationTriangle,
    FaListUl,
    FaDownload,
    FaSyncAlt,
    FaCloudUploadAlt,
    FaRecycle,
} from "react-icons/fa";

export default function SystemIndex() {
    const {
        auth,
        stats = {},
        flash = {},
        basePath = "superadmin",
        backups: initialBackups = [],
    } = usePage().props;

    const [loading, setLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [keepMode, setKeepMode] = useState("superadmin_only");
    const [backupFiles, setBackupFiles] = useState(initialBackups);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [fileToRestore, setFileToRestore] = useState("");

    // ✅ Toast helper
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        if (flash?.success) showToast(flash.success, "success");
        if (flash?.error) showToast(flash.error, "error");
    }, [flash]);

    // 🔁 Fetch backups
    const fetchBackups = async () => {
        try {
            const res = await fetch(route(`${basePath}.system.listBackups`), {
                credentials: "same-origin",
            });
            const json = await res.json();
            setBackupFiles(json.backups || []);
        } catch {
            showToast("Failed to load backups.", "error");
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    /** 💾 Create backup */
    const handleBackup = async () => {
        setLoading("backup");
        try {
            const csrf = document.querySelector(
                'meta[name="csrf-token"]',
            )?.content;
            const res = await fetch(route(`${basePath}.system.backup`), {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrf, Accept: "application/json" },
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) {
                showToast(
                    json.message || "✅ Backup completed successfully.",
                    "success",
                );
                await fetchBackups();
            } else showToast(json.message || "❌ Backup failed.", "error");
        } catch {
            showToast("❌ Backup failed to execute.", "error");
        } finally {
            setLoading(null);
        }
    };

    /** 🗑 Delete backup */
    const handleDeleteBackup = (file) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
    };

    const confirmDeleteBackup = async () => {
        if (!fileToDelete) return;
        setLoading("delete");
        try {
            const csrf = document.querySelector(
                'meta[name="csrf-token"]',
            )?.content;
            const res = await fetch(
                route(`${basePath}.system.deleteBackup`, {
                    file: fileToDelete,
                }),
                {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": csrf,
                        Accept: "application/json",
                    },
                    credentials: "include",
                },
            );
            const json = await res.json();
            if (json.success) {
                showToast(json.message, "success");
                await fetchBackups();
            } else
                showToast(
                    json.message || "❌ Failed to delete backup.",
                    "error",
                );
        } catch {
            showToast("❌ Failed to delete backup.", "error");
        } finally {
            setFileToDelete(null);
            setShowDeleteModal(false);
            setLoading(null);
        }
    };

    /** 🩹 Restore backup */
    const confirmRestoreBackup = async () => {
        if (!fileToRestore) {
            showToast("Please select a backup file to restore.", "error");
            return;
        }
        setShowRestoreModal(false);
        setLoading("restore");

        try {
            const csrf = document.querySelector(
                'meta[name="csrf-token"]',
            )?.content;
            const res = await fetch(route(`${basePath}.system.restore`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json",
                },
                body: JSON.stringify({ file: fileToRestore }),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) showToast(json.message, "success");
            else showToast(json.message || "❌ Restore failed.", "error");
        } catch {
            showToast("❌ Restore request failed.", "error");
        } finally {
            setLoading(null);
        }
    };

    /** ♻️ System Reset */
    const confirmReset = async () => {
        setShowConfirm(false);
        setLoading("reset");

        try {
            const csrf = document.querySelector(
                'meta[name="csrf-token"]',
            )?.content;
            const res = await fetch(route(`${basePath}.system.reset`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json",
                },
                body: JSON.stringify({ keep: keepMode }),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) showToast(json.message, "success");
            else showToast(json.message || "❌ Reset failed.", "error");
        } catch {
            showToast("❌ Reset request failed.", "error");
        } finally {
            setLoading(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-900">
                    System Control
                </h2>
            }
        >
            <Head title="System Control" />

            {/* ✅ Toast */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 px-4 py-3 rounded-md shadow-md text-white z-50 ${
                        toast.type === "success"
                            ? "bg-green-600"
                            : toast.type === "error"
                              ? "bg-red-600"
                              : "bg-gray-700"
                    }`}
                >
                    <div className="flex items-center gap-2 font-medium">
                        {toast.type === "success" && <FaCheckCircle />}
                        {toast.type === "error" && <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* ⚙️ Main Content */}
            <div className="py-8 max-w-6xl mx-auto space-y-8">
                {/* 🧮 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(stats).map(([key, val]) => (
                        <div
                            key={key}
                            className="bg-white shadow rounded-lg p-4 text-center border hover:shadow-md transition"
                        >
                            <div className="text-sm uppercase text-gray-500">
                                {key}
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                                {val}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 💾 Backup Section */}
                <div className="bg-white p-6 shadow rounded-lg border space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            <FaDatabase className="inline mr-2" /> Database
                            Backups
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleBackup}
                                disabled={loading === "backup"}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <FaHdd />{" "}
                                {loading === "backup"
                                    ? "Creating..."
                                    : "Create Backup"}
                            </button>
                            <button
                                onClick={() => setShowRestoreModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                            >
                                <FaRedo /> Restore
                            </button>
                        </div>
                    </div>

                    {/* Table of backups */}
                    <table className="min-w-full text-sm border-t">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-3 font-semibold">
                                    File
                                </th>
                                <th className="text-left p-3 font-semibold">
                                    Size
                                </th>
                                <th className="text-left p-3 font-semibold">
                                    Date
                                </th>
                                <th className="text-left p-3 font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {backupFiles.length ? (
                                backupFiles.map((b) => (
                                    <tr
                                        key={b.file}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-3 font-mono">
                                            {b.file}
                                        </td>
                                        <td className="p-3">{b.size}</td>
                                        <td className="p-3">{b.date}</td>
                                        <td className="p-3 flex gap-3">
                                            <a
                                                href={`/${basePath}/system/download/${b.file}`}
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                <FaDownload /> Download
                                            </a>
                                            <button
                                                onClick={() =>
                                                    handleDeleteBackup(b.file)
                                                }
                                                className="text-red-600 hover:underline flex items-center gap-1"
                                            >
                                                <FaTrashAlt /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center text-gray-500 py-4"
                                    >
                                        No backups available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ♻️ Reset System */}
                <div className="bg-white p-6 shadow rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaRecycle /> System Reset
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                        Reset all data while keeping superadmin accounts or
                        start completely fresh.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <select
                            value={keepMode}
                            onChange={(e) => setKeepMode(e.target.value)}
                            className="border rounded px-3 py-2"
                        >
                            <option value="superadmin_only">
                                Keep Superadmins Only
                            </option>
                            <option value="admins_and_superadmin">
                                Keep Admins + Superadmins
                            </option>
                            <option value="none">Reset Everything</option>
                        </select>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2"
                        >
                            <FaTrashAlt /> Reset Now
                        </button>
                    </div>
                </div>
            </div>

            {/* 🗑 Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete{" "}
                            <b>{fileToDelete}</b>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteBackup}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ♻️ Restore Modal */}
            {showRestoreModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-3">
                            Select Backup to Restore
                        </h3>
                        <select
                            value={fileToRestore}
                            onChange={(e) => setFileToRestore(e.target.value)}
                            className="border rounded px-3 py-2 w-full mb-4"
                        >
                            <option value="">-- Choose File --</option>
                            {backupFiles.map((b) => (
                                <option key={b.file} value={b.file}>
                                    {b.file} ({b.size})
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRestoreModal(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRestoreBackup}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ⚠️ Confirm Reset Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2 text-red-600">
                            Confirm System Reset
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This will permanently delete data according to your
                            selected mode.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReset}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
