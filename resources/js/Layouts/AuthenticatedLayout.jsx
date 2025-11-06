import React, { useState, useEffect, createContext, useContext } from "react";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaTachometerAlt,
    FaFileInvoiceDollar,
    FaUsers,
    FaChartBar,
    FaCog,
    FaBars,
    FaUserPlus,
    FaChartLine,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

/* ---------- NProgress Setup ---------- */
NProgress.configure({ showSpinner: false });
if (typeof window !== "undefined" && !window.__nprogressSetupDone) {
    document.addEventListener("inertia:start", () => NProgress.start());
    document.addEventListener("inertia:finish", () => NProgress.done());
    document.addEventListener("inertia:error", () => NProgress.done());
    window.__nprogressSetupDone = true;
}

/* ---------- Confirm Modal Context ---------- */
const ConfirmContext = createContext(null);
export const useConfirm = () => useContext(ConfirmContext);

function ConfirmModal({ show, title, message, type, onConfirm, onCancel }) {
    if (!show) return null;
    const colorMap = {
        danger: "bg-red-600 hover:bg-red-700",
        warning: "bg-yellow-500 hover:bg-yellow-600",
        info: "bg-blue-600 hover:bg-blue-700",
    };
    const color = colorMap[type] || colorMap.info;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="mt-3 text-gray-700">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-md font-medium ${color}`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- MAIN LAYOUT ---------- */
export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page?.props?.auth?.user || {};
    const basePath =
        page?.props?.basePath || (user.is_super_admin ? "superadmin" : "admin");
    const currentUrl =
        page?.url ||
        (typeof window !== "undefined" ? window.location.pathname : "") ||
        "";

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
        onConfirm: null,
    });

    /* ---------- Global Loading State ---------- */
    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setTimeout(() => setLoading(false), 300);

        window.addEventListener("inertia:start", start);
        window.addEventListener("inertia:finish", finish);
        window.addEventListener("inertia:error", finish);

        return () => {
            window.removeEventListener("inertia:start", start);
            window.removeEventListener("inertia:finish", finish);
            window.removeEventListener("inertia:error", finish);
        };
    }, []);

    /* ---------- Confirm Modal Handler ---------- */
    useEffect(() => {
        window.appConfirm = (title, message, callback, type = "info") => {
            setConfirmState({
                show: true,
                title,
                message,
                type,
                onConfirm: () => {
                    callback?.();
                    setConfirmState((prev) => ({ ...prev, show: false }));
                },
            });
        };
    }, []);

    const closeConfirm = () =>
        setConfirmState((prev) => ({ ...prev, show: false }));

    if (!user || !user.role)
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Loading dashboard...
            </div>
        );

    const isSuperAdmin = user.is_super_admin || user.role === "superadmin";
    const isAdmin =
        isSuperAdmin || user.role === "admin" || user.role === "staff";

    /* ---------- Sidebar Menu ---------- */
    const adminMenu = [
        {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            route: `/${basePath}/dashboard`,
        },
        {
            name: "Customers",
            icon: <FaUsers />,
            route: `/${basePath}/customers`,
        },
        {
            name: "Loans",
            icon: <FaFileInvoiceDollar />,
            route: `/${basePath}/loans`,
        },
        {
            name: "Reports",
            icon: <FaChartBar />,
            route: `/${basePath}/reports`,
        },
        { name: "Settings", icon: <FaCog />, route: `/${basePath}/settings` },
    ];

    const superAdminExtras = [
        {
            name: "Manage Users",
            icon: <FaUserPlus />,
            route: "/superadmin/users",
        },
        {
            name: "Activity Log",
            icon: <FaChartLine />,
            route: "/superadmin/activity",
        },
        {
            name: "System Control",
            icon: <FaCog className="text-red-600" />,
            route: "/superadmin/system",
            danger: true,
        },
    ];

    const menuItems = isSuperAdmin
        ? [...adminMenu, ...superAdminExtras]
        : adminMenu;

    const avatar = user?.profile_photo_url
        ? user.profile_photo_url
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;

    const isDetailPage =
        currentUrl.includes("/loans/") ||
        currentUrl.includes("/customers/") ||
        currentUrl.includes("/users/");

    /* ---------- LAYOUT ---------- */
    return (
        <ConfirmContext.Provider value={() => {}}>
            <div className="flex bg-gray-50 text-gray-900 min-h-screen overflow-hidden relative">
                {/* 🔄 Global Joelaar Overlay Loader */}
                {loading && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300 bg-opacity-80 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <img
                                src="/images/logo.png"
                                alt="Joelaar"
                                className="h-16 w-auto animate-pulse drop-shadow-lg mb-4"
                            />
                            <div className="loader"></div>
                            <p className="text-white mt-4 text-lg font-semibold tracking-wide">
                                Loading, please wait...
                            </p>
                        </div>
                    </div>
                )}

                {/* Sidebar */}
                {isAdmin && (
                    <aside
                        className={`hidden md:flex flex-col transition-all duration-300 bg-white shadow-md border-r fixed left-0 top-0 bottom-0 z-40 ${
                            sidebarOpen ? "w-64" : "w-20"
                        }`}
                    >
                        <div className="flex items-center justify-between p-4 border-b bg-gray-900">
                            <Link href="/" className="flex items-center gap-3">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo"
                                    className="h-10 w-auto object-contain"
                                />
                                {sidebarOpen && (
                                    <div className="flex flex-col leading-[1.1]">
                                        <span className="font-extrabold text-white text-lg">
                                            Joelaar
                                        </span>
                                        <span className="text-gray-300 text-[13px]">
                                            Micro-Credit
                                        </span>
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-white hover:text-gray-300 p-2 rounded transition"
                            >
                                {sidebarOpen ? (
                                    <FaChevronLeft />
                                ) : (
                                    <FaChevronRight />
                                )}
                            </button>
                        </div>

                        <nav className="flex-1 py-4 overflow-y-auto">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.route}
                                    className={`flex items-center px-5 py-3 my-1 rounded-md transition-colors ${
                                        item.danger
                                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                                            : currentUrl.startsWith(item.route)
                                              ? "bg-blue-100 text-blue-700 font-semibold"
                                              : "text-gray-800 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {sidebarOpen && (
                                        <span className="ml-4">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                )}

                {/* Main Content */}
                <div
                    className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
                        isAdmin ? (sidebarOpen ? "md:ml-64" : "md:ml-20") : ""
                    }`}
                >
                    {/* Navbar */}
                    <nav className="border-b border-gray-200 bg-white fixed top-0 right-0 left-0 md:left-auto z-30 h-[3.2rem]">
                        <div className="flex justify-between items-center px-4 sm:px-6 h-full">
                            <div className="flex items-center ml-auto">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
                                            <img
                                                src={avatar}
                                                alt="Avatar"
                                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                            />
                                            <span className="hidden sm:block">
                                                {user?.name || "User"}
                                            </span>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content className="mt-2 w-44 rounded-lg shadow-lg bg-white/70 backdrop-blur-md ring-1 ring-gray-100 overflow-hidden border border-gray-100">
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            ✏️ Edit Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700"
                                        >
                                            🚪 Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </nav>

                    {/* Header + Animated Content */}
                    <header className="bg-white shadow-sm px-4 sm:px-6 py-2 mt-[3.3rem] sticky top-[3.2rem] z-20">
                        {header}
                    </header>

                    <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={page.url}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            <ConfirmModal
                show={confirmState.show}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                onConfirm={() => {
                    confirmState.onConfirm?.();
                    closeConfirm();
                }}
                onCancel={closeConfirm}
            />
        </ConfirmContext.Provider>
    );
}

/* 🔹 Custom Joelaar Loader Animation */
const style = document.createElement("style");
style.innerHTML = `
.loader {
  border: 5px solid rgba(255,255,255,0.3);
  border-top: 5px solid #ffffff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
