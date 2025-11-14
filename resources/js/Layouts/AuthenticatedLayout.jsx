import React, { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import Sidebar from "../Components/Sidebar.jsx";

export function useConfirm() {
    const [state, setState] = useState({
        open: false,
        message: "",
        onConfirm: null,
    });

    const confirm = (message, onConfirm) => {
        setState({ open: true, message, onConfirm });
    };

    const ConfirmDialog = () =>
        state.open ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-80">
                    <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-line">
                        {state.message}
                    </p>

                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={() => setState({ ...state, open: false })}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                state.onConfirm?.();
                                setState({ ...state, open: false });
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        ) : null;

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

    const { ConfirmDialog } = useConfirm();

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
            {/* ===== SIDEBAR (STABLE WIDTH) ===== */}
            <div className="flex-shrink-0">
                <Sidebar />
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex flex-col">
                {/* TOP NAV */}
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="w-full py-4 px-6 flex justify-between items-center">
                        {header}

                        <div className="relative" ref={dropdownRef}>
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
                                    shadow-lg rounded-md py-2 z-[9999]"
                                >
                                    <Link
                                        href={route("profile.edit")}
                                        onClick={() => setOpen(false)}
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 
                                        hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Edit Profile
                                    </Link>

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

                {/* PAGE CONTENT */}
                <main className="p-6 flex-1">{children}</main>

                {/* GLOBAL CONFIRMATION DIALOG */}
                <ConfirmDialog />
            </div>
        </div>
    );
}
