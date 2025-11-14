import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import {
    FaSync,
    FaTrash,
    FaUndo,
    FaUserEdit,
    FaUserTimes,
    FaPaperPlane,
    FaTimesCircle,
} from "react-icons/fa";

/* 🧩 Internal component — safely inside layout provider */
function CustomerTable({ customers, counts, filters }) {
    const confirm = useConfirm();
    const [search, setSearch] = useState(filters.q || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");

    /* 🔍 Auto-search */
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route("superadmin.manage-customers.index"),
                { q: search, status: statusFilter },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delay);
    }, [search, statusFilter]);

    /* 🧹 Clear */
    const handleClear = () => {
        setSearch("");
        setStatusFilter("all");
        router.get(
            route("superadmin.manage-customers.index"),
            {},
            { replace: true },
        );
    };

    /* ⚡ Card click */
    const handleCardClick = (statusKey) => {
        setStatusFilter(statusKey === "total" ? "all" : statusKey);
    };

    /* 💥 Actions */
    const handleAction = (type, id, name) => {
        switch (type) {
            case "restore":
                confirm("Restore Customer", `Restore ${name}?`, () =>
                    router.post(
                        route("superadmin.manage-customers.restore", id),
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                window.toast?.success?.(`✅ ${name} restored.`),
                            onError: () =>
                                window.toast?.error?.(
                                    `❌ Failed to restore ${name}.`,
                                ),
                        },
                    ),
                );
                break;

            case "delete":
                confirm(
                    "Deactivate Customer",
                    `Move ${name} to trash?`,
                    () =>
                        router.delete(
                            route("superadmin.manage-customers.destroy", id),
                            {
                                preserveScroll: true,
                                onSuccess: () =>
                                    window.toast?.success?.(
                                        `✅ ${name} moved to trash.`,
                                    ),
                                onError: () =>
                                    window.toast?.error?.(
                                        `❌ Failed to delete ${name}.`,
                                    ),
                            },
                        ),
                    "warning",
                );
                break;

            case "force":
                confirm(
                    "Permanently Delete",
                    `Permanently delete ${name}?`,
                    () =>
                        router.delete(
                            route(
                                "superadmin.manage-customers.forceDelete",
                                id,
                            ),
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () =>
                                    window.toast?.success?.(
                                        `🗑️ ${name} deleted permanently.`,
                                    ),
                                onError: () =>
                                    window.toast?.error?.(
                                        `❌ Failed to permanently delete ${name}.`,
                                    ),
                            },
                        ),
                    "danger",
                );
                break;

            case "resend":
                confirm(
                    "Resend Credentials",
                    `Resend login credentials to ${name}?`,
                    () =>
                        router.post(
                            route("superadmin.manage-customers.resend", id),
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () =>
                                    window.toast?.success?.(
                                        `📧 Credentials resent to ${name}.`,
                                    ),
                                onError: () =>
                                    window.toast?.error?.(
                                        `❌ Failed to resend credentials to ${name}.`,
                                    ),
                            },
                        ),
                );
                break;

            default:
                break;
        }
    };

    /* 🧩 UI */
    return (
        <>
            {/* Search + Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-72 focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                </select>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
                >
                    <FaTimesCircle /> Clear
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {Object.entries(counts).map(([key, val]) => (
                    <div
                        key={key}
                        onClick={() => handleCardClick(key)}
                        className={`cursor-pointer bg-white border rounded-lg p-3 shadow-sm text-center transition transform hover:-translate-y-1 ${
                            statusFilter === key ? "ring-2 ring-blue-500" : ""
                        }`}
                    >
                        <div className="text-xs uppercase text-gray-500">
                            {key}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {val}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Created</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length > 0 ? (
                            customers.map((c) => (
                                <tr
                                    key={c.id}
                                    className={`border-b hover:bg-gray-50 transition ${
                                        c.deleted_at ? "opacity-70" : ""
                                    }`}
                                >
                                    <td className="px-4 py-2 font-medium">
                                        {c.full_name}
                                    </td>
                                    <td className="px-4 py-2">
                                        {c.email || "—"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {c.phone || "—"}
                                    </td>
                                    <td className="px-4 py-2 capitalize">
                                        {c.deleted_at ? (
                                            <span className="text-red-600 font-semibold">
                                                Deleted
                                            </span>
                                        ) : (
                                            <span
                                                className={`font-semibold ${
                                                    c.status === "active"
                                                        ? "text-green-600"
                                                        : c.status ===
                                                            "inactive"
                                                          ? "text-gray-500"
                                                          : "text-yellow-600"
                                                }`}
                                            >
                                                {c.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 text-xs">
                                        {new Date(
                                            c.created_at,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {!c.deleted_at && (
                                                <>
                                                    <Link
                                                        href={route(
                                                            "superadmin.manage-customers.edit",
                                                            c.id,
                                                        )}
                                                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-600"
                                                        title="Edit"
                                                    >
                                                        <FaUserEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                "resend",
                                                                c.id,
                                                                c.full_name,
                                                            )
                                                        }
                                                        className="p-2 bg-green-100 hover:bg-green-200 rounded text-green-600"
                                                        title="Resend Credentials"
                                                    >
                                                        <FaPaperPlane />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                "delete",
                                                                c.id,
                                                                c.full_name,
                                                            )
                                                        }
                                                        className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-600"
                                                        title="Deactivate"
                                                    >
                                                        <FaUserTimes />
                                                    </button>
                                                </>
                                            )}
                                            {c.deleted_at && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                "restore",
                                                                c.id,
                                                                c.full_name,
                                                            )
                                                        }
                                                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-600"
                                                        title="Restore"
                                                    >
                                                        <FaUndo />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                "force",
                                                                c.id,
                                                                c.full_name,
                                                            )
                                                        }
                                                        className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-600"
                                                        title="Permanently Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center py-6 text-gray-500"
                                >
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

/* ---------------------------------------------------
   ✅ Main Page Component
--------------------------------------------------- */
export default function ManageCustomersIndex() {
    const { props } = usePage();
    const { customers = [], counts = {}, filters = {} } = props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Manage Customers
                    </h2>
                    <button
                        onClick={() =>
                            router.reload({ only: ["customers", "counts"] })
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition"
                    >
                        <FaSync className="animate-spin-slow" /> Refresh
                    </button>
                </div>
            }
        >
            <CustomerTable
                customers={customers}
                counts={counts}
                filters={filters}
            />
        </AuthenticatedLayout>
    );
}
