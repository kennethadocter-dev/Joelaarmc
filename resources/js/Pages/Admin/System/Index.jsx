import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    FaDatabase,
    FaRedo,
    FaTrashAlt,
    FaHdd,
    FaCheckCircle,
    FaExclamationTriangle,
    FaListUl,
    FaEye,
    FaDownload,
    FaSyncAlt,
} from "react-icons/fa";

export default function SystemIndex() {
    const {
        auth,
        stats = {},
        flash = {},
        basePath,
        backups: initialBackups = [],
    } = usePage().props;

    const [loading, setLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [keepMode, setKeepMode] = useState("superadmin_only");
    const [backupFiles, setBackupFiles] = useState(initialBackups);
    const [previewStats, setPreviewStats] = useState(null);

    // 🔹 Delete backup modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    // 🔹 Restore backup modal states
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [fileToRestore, setFileToRestore] = useState("");

    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        if (flash?.success) showToast(flash.success, "success");
        if (flash?.error) showToast(flash.error, "error");
    }, [flash]);

    /** ✅ Fetch list of backups */
    const fetchBackups = async () => {
        try {
            const res = await fetch(route(`${basePath}.system.listBackups`), {
                credentials: "same-origin",
            });
            const json = await res.json();

            console.log("🧾 API backups response:", json); // 👈 ADD THIS LINE

            setBackupFiles(json.backups || []);
        } catch {
            showToast("Failed to load backups.", "error");
        }
    };

    /** 🔁 Refresh backups */
    const handleRefreshBackups = async () => {
        setLoading("refresh");
        await fetchBackups();
        setLoading(null);
        showToast("✅ Backups refreshed.", "success");
    };

    /** 👁 Preview reset impact */
    const fetchPreview = async () => {
        setLoading("preview");
        try {
            const res = await fetch(route(`${basePath}.system.previewReset`), {
                credentials: "same-origin",
            });
            const json = await res.json();
            setPreviewStats(json.stats);
            showToast("✅ Preview updated.", "success");
        } catch {
            showToast("❌ Could not preview data.", "error");
        } finally {
            setLoading(null);
        }
    };

    /** 💾 Create backup using secure CSRF fetch and instant refresh */
    const handleBackup = async (e) => {
        e?.preventDefault();
        setLoading("backup");

        try {
            // 🧠 Get CSRF token from <meta> tag
            const csrf = document.querySelector(
                'meta[name="csrf-token"]',
            )?.content;

            // ✅ POST request to create backup
            const res = await fetch(route(`${basePath}.system.backup`), {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json",
                },
                credentials: "include", // sends cookies & token
            });

            const json = await res.json();

            if (json.success) {
                showToast(
                    json.message || "✅ Backup completed successfully.",
                    "success",
                );
                // 🔁 Force reload the latest backup files
                await fetchBackups();
                // Refresh backup list dynamically
                setBackupFiles(json.backups || []);
            } else {
                showToast(json.message || "❌ Backup failed.", "error");
            }
        } catch (err) {
            console.error("❌ Backup error:", err);
            showToast("❌ Backup failed to execute.", "error");
        } finally {
            setLoading(null);
        }
    };

    /** 🗑 Delete backup file */
    const handleDeleteBackup = (file) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
    };

    const confirmDeleteBackup = () => {
        if (!fileToDelete) return;
        setShowDeleteModal(false);
        setLoading("delete");

        router.delete(route(`${basePath}.system.deleteBackup`, fileToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                showToast("🗑 Backup deleted successfully.", "success");
                fetchBackups();
            },
            onError: () => showToast("❌ Failed to delete backup.", "error"),
            onFinish: () => {
                setFileToDelete(null);
                setLoading(null);
            },
        });
    };

    /** 🩹 Restore backup (open modal first) */
    const openRestoreModal = () => {
        setFileToRestore("");
        setShowRestoreModal(true);
        fetchBackups();
    };

    const confirmRestoreBackup = () => {
        if (!fileToRestore) {
            showToast("Please select a backup file to restore.", "error");
            return;
        }

        setShowRestoreModal(false);
        setLoading("restore");

        router.post(
            route(`${basePath}.system.restore`),
            { file: fileToRestore },
            {
                preserveScroll: true,
                onSuccess: () =>
                    showToast("✅ Database restored successfully.", "success"),
                onError: () => showToast("❌ Restore failed.", "error"),
                onFinish: () => setLoading(null),
            },
        );
    };

    /** ♻️ Reset / Restore actions */
    const executeAction = (type, routeName) => {
        setShowConfirm(false);
        setLoading(type);
        const payload = type === "reset" ? { keep: keepMode } : {};

        router.post(route(`${basePath}.${routeName}`), payload, {
            preserveScroll: true,
            onFinish: () => setLoading(null),
            onSuccess: () => {
                showToast(`${type} completed successfully.`, "success");
                if (type === "backup") fetchBackups();
            },
            onError: () => showToast(`${type} failed.`, "error"),
        });
    };

    const handleAction = (type, routeName) => {
        if (type === "reset") {
            setPendingAction({ type, routeName });
            setShowConfirm(true);
        } else if (type === "restore") {
            openRestoreModal();
        } else if (type === "backup") {
            handleBackup();
        } else {
            executeAction(type, routeName);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);
    // ✅ React to updated backups coming from Laravel via Inertia
    useEffect(() => {
        if (initialBackups && initialBackups.length > 0) {
            setBackupFiles(initialBackups);
        }
    }, [initialBackups]);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-lg font-semibold text-gray-900">
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

            {/* ⚠️ Reset Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                    <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Confirm Reset
                        </h3>
                        <p className="mt-2 text-gray-600 text-sm">
                            This action will delete most data and cannot be
                            undone.
                        </p>
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Keep which users?
                            </label>
                            <select
                                value={keepMode}
                                onChange={(e) => setKeepMode(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-gray-400 focus:border-gray-400"
                            >
                                <option value="superadmin_only">
                                    Superadmin Only
                                </option>
                                <option value="keep_admins">
                                    Superadmin + Admins
                                </option>
                                <option value="keep_all_staff">
                                    Superadmin + Admins + Staff
                                </option>
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    executeAction(
                                        pendingAction.type,
                                        pendingAction.routeName,
                                    )
                                }
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🗑 Delete Backup Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                    <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Delete Backup
                        </h3>
                        <p className="mt-2 text-gray-600 text-sm">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-gray-800">
                                {fileToDelete}
                            </span>{" "}
                            permanently?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteBackup}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ♻️ Restore Backup Modal */}
            {showRestoreModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                    <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Restore Backup
                        </h3>
                        <p className="mt-2 text-gray-600 text-sm">
                            Choose which backup file you want to restore.
                        </p>
                        <select
                            className="mt-4 w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                            value={fileToRestore}
                            onChange={(e) => setFileToRestore(e.target.value)}
                        >
                            <option value="">-- Select Backup File --</option>
                            {backupFiles.map((b) => (
                                <option key={b.file} value={b.file}>
                                    {b.file} ({b.size})
                                </option>
                            ))}
                        </select>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowRestoreModal(false)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRestoreBackup}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="py-6 max-w-5xl mx-auto space-y-8">
                {/* 📊 Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Users", value: stats.users },
                        { label: "Customers", value: stats.customers },
                        { label: "Loans", value: stats.loans },
                        { label: "Payments", value: stats.payments },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center"
                        >
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                {item.label}
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {item.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* 🧾 Last Backup */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-gray-800 text-sm font-medium">
                        Last Backup:{" "}
                        <span className="font-semibold text-gray-900">
                            {stats.last_backup || "No backups yet"}
                        </span>
                    </p>
                </div>

                {/* ⚙️ Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        type="button"
                        onClick={(e) => handleBackup(e)}
                        disabled={loading === "backup"}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md transition disabled:opacity-50"
                    >
                        <FaHdd />
                        <span>
                            {loading === "backup"
                                ? "Backing up..."
                                : "Backup Data"}
                        </span>
                    </button>

                    <button
                        onClick={() =>
                            handleAction("restore", "system.restore")
                        }
                        disabled={loading === "restore"}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:opacity-50"
                    >
                        <FaRedo />
                        <span>
                            {loading === "restore"
                                ? "Restoring..."
                                : "Restore Backup"}
                        </span>
                    </button>

                    <button
                        onClick={() => handleAction("reset", "system.reset")}
                        disabled={loading === "reset"}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition disabled:opacity-50"
                    >
                        <FaTrashAlt />
                        <span>
                            {loading === "reset"
                                ? "Resetting..."
                                : "Reset All Data"}
                        </span>
                    </button>
                </div>

                {/* 👁️ Preview + Backups */}
                <div className="space-y-6">
                    {/* Preview */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                <FaEye /> Preview Data Before Reset
                            </h3>
                            <button
                                onClick={fetchPreview}
                                disabled={loading === "preview"}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md text-sm disabled:opacity-50"
                            >
                                {loading === "preview"
                                    ? "Loading..."
                                    : "Refresh"}
                            </button>
                        </div>
                        {previewStats ? (
                            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(previewStats).map(
                                    ([key, val]) => (
                                        <li
                                            key={key}
                                            className="bg-gray-50 border border-gray-200 rounded p-3 text-center"
                                        >
                                            <p className="text-xs text-gray-500 uppercase font-medium">
                                                {key}
                                            </p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {val}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Click refresh to view data preview.
                            </p>
                        )}
                    </div>

                    {/* Backups */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                <FaListUl /> Backup Files
                            </h3>
                            <button
                                onClick={handleRefreshBackups}
                                disabled={loading === "refresh"}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md text-sm disabled:opacity-50"
                            >
                                <FaSyncAlt
                                    className={
                                        loading === "refresh"
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                                <span>
                                    {loading === "refresh"
                                        ? "Refreshing..."
                                        : "Refresh"}
                                </span>
                            </button>
                        </div>

                        {backupFiles.length ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-gray-700 font-medium">
                                        <th className="py-2 text-left">File</th>
                                        <th className="py-2 text-left">Size</th>
                                        <th className="py-2 text-left">Date</th>
                                        <th className="py-2 text-left">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backupFiles.map((b, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="py-2">{b.file}</td>
                                            <td className="py-2">{b.size}</td>
                                            <td className="py-2">{b.date}</td>
                                            <td className="py-2 flex gap-2">
                                                <a
                                                    href={route(
                                                        `${basePath}.system.download`,
                                                        b.file,
                                                    )}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded text-sm"
                                                >
                                                    <FaDownload />
                                                    <span>Download</span>
                                                </a>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteBackup(
                                                            b.file,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm"
                                                >
                                                    <FaTrashAlt />
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No backups found.
                            </p>
                        )}

                        {/* Upload */}
                        <form
                            method="POST"
                            action={route(`${basePath}.system.upload`)}
                            encType="multipart/form-data"
                            className="mt-4 border-t pt-4"
                        >
                            <p className="text-gray-800 text-sm mb-2 font-semibold">
                                Upload Backup (.sqlite or .sql)
                            </p>
                            <input
                                type="file"
                                name="backup_file"
                                accept=".sqlite,.sql"
                                required
                                className="block w-full text-sm text-gray-700 mb-2"
                            />
                            <button
                                type="submit"
                                className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md text-sm"
                            >
                                Upload &amp; Restore
                            </button>
                        </form>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-3 text-gray-700 font-medium">
                            <FaDatabase className="animate-spin text-lg" />
                            <span>Processing {loading}...</span>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
