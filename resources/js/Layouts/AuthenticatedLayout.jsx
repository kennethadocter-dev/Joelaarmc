import React, { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import Sidebar from "../Components/Sidebar.jsx";

/**
 * Dummy useConfirm export so other files that still import it don't crash.
 * (Currently not used for the delete confirmation anymore.)
 */
export function useConfirm() {
    const confirm = () => {};
    const ConfirmDialog = () => null;
    return { confirm, ConfirmDialog };
}

/* ============================================================
   MAIN AUTHENTICATED LAYOUT
   ============================================================ */
export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route("logout"));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="flex-shrink-0 z-[100]">
                <Sidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top Nav */}
                <header className="bg-white dark:bg-gray-800 shadow relative z-[9999]">
                    <div className="w-full py-4 px-6 flex justify-between items-center">
                        {header}

                        <div className="relative z-[10000]" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 
                                    dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition"
                            >
                                <FaUserCircle className="text-gray-600 dark:text-gray-300 text-2xl" />
                                <span className="text-gray-700 dark:text-gray-200 font-medium capitalize">
                                    {user?.role === "superadmin"
                                        ? "Super Admin"
                                        : user?.role}
                                </span>
                                <FaChevronDown className="text-gray-500" />
                            </button>

                            {open && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 
                                    shadow-lg rounded-md py-2 z-[10001]"
                                >
                                    <Link
                                        href={route("profile.edit")}
                                        onClick={() => setOpen(false)}
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 
                                            hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Edit Profile
                                    </Link>

                                    {/* SETTINGS LINK APPEARS FOR ADMIN + SUPERADMIN */}
                                    {(user?.role === "admin" ||
                                        user?.role === "superadmin") && (
                                        <Link
                                            href={route("admin.settings")}
                                            onClick={() => setOpen(false)}
                                            className="block px-4 py-2 text-gray-700 dark:text-gray-200 
                                                hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Settings
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 bg-red-600 text-white 
                                            hover:bg-red-700 rounded-sm transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 flex-1">
                    {/* Back button except on dashboards */}
                    {!route().current("admin.dashboard") &&
                        !route().current("superadmin.dashboard") && (
                            <button
                                onClick={() => window.history.back()}
                                className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                                    text-gray-700 dark:text-gray-200 rounded-lg 
                                    hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                ← Back
                            </button>
                        )}

                    {children}
                </main>
            </div>
        </div>
    );
}
