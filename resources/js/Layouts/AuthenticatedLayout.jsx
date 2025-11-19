import React, {
    useState,
    useEffect,
    useRef,
    createContext,
    useContext,
} from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import Sidebar from "../Components/Sidebar.jsx";

/* =========================================================
   GLOBAL CONFIRMATION SYSTEM
========================================================= */
const ConfirmContext = createContext(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        console.warn("⚠ useConfirm called outside provider");
        return () => {};
    }
    return ctx.confirm;
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth = {} } = usePage().props;
    const user = auth.user || { name: "User", email: "user@example.com" };

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    /* ============================
       CONFIRMATION STATE
    ==============================*/
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        type: "warning",
        onConfirm: null,
    });

    const confirm = (title, message, onConfirm, type = "warning") => {
        setConfirmState({
            open: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const closeConfirm = () =>
        setConfirmState((prev) => ({
            ...prev,
            open: false,
        }));

    /* LOGOUT */
    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route("logout"));
    };

    /* Close dropdown on outside click */
    useEffect(() => {
        const close = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    /* ============================
       CONFIRM POPUP UI
    ==============================*/
    const ConfirmDialog = (
        <div>
            {confirmState.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-[90%] max-w-md">
                        <h2 className="text-xl font-semibold">
                            {confirmState.title}
                        </h2>
                        <p className="mt-3">{confirmState.message}</p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeConfirm}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    closeConfirm();
                                    confirmState.onConfirm?.();
                                }}
                                className={`px-4 py-2 rounded text-white ${
                                    confirmState.type === "danger"
                                        ? "bg-red-600"
                                        : "bg-blue-600"
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    /* ============================
       MAIN LAYOUT
    ==============================*/

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
                {/* Sidebar */}
                <div className="flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col">
                    {/* HEADER */}
                    <header className="bg-white dark:bg-gray-800 shadow relative z-50">
                        <div className="w-full py-4 px-6 flex justify-between items-center">
                            {header}

                            {/* PROFILE DROPDOWN */}
                            <div className="relative z-50" ref={dropdownRef}>
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="
                                        flex items-center gap-2 px-4 py-2 rounded 
                                        text-white font-semibold
                                        bg-gradient-to-r from-red-700 to-red-500
                                        hover:from-red-400 hover:to-red-300 
                                        shadow 
                                        transition-all
                                    "
                                >
                                    <FaUserCircle className="text-2xl text-white" />
                                    <span className="text-white">
                                        {user?.name}
                                    </span>
                                    <FaChevronDown className="text-white" />
                                </button>

                                {open && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-3 z-50 border border-gray-200 dark:border-gray-700">
                                        {/* Signed in as */}
                                        <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Signed in as
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                {user.email}
                                            </p>
                                        </div>

                                        <Link
                                            href={route("profile.edit")}
                                            className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            Edit Profile
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <main className="p-6 flex-1">{children}</main>
                </div>

                {ConfirmDialog}
            </div>
        </ConfirmContext.Provider>
    );
}
