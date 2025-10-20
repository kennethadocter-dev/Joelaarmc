import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect, createContext, useContext } from "react";
import {
    FaTachometerAlt,
    FaFileInvoiceDollar,
    FaUsers,
    FaChartBar,
    FaCog,
    FaBars,
    FaUserPlus,
    FaChartLine,
} from "react-icons/fa";

/* ---------------------- GLOBAL CONFIRM MODAL CONTEXT ---------------------- */
const ConfirmContext = createContext(null);
export const useConfirm = () => useContext(ConfirmContext);

/* ---------------------- CONFIRM MODAL ---------------------- */
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

/* ---------------------- MAIN LAYOUT ---------------------- */
export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page?.props?.auth?.user || {};
    const can = page?.props?.can || page?.props?.auth?.can || {};
    const flash = page?.props?.flash || {};
    const basePath = page?.props?.basePath;
    const currentUrl =
        page?.url ||
        (typeof window !== "undefined" ? window.location.pathname : "") ||
        "";

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
        onConfirm: null,
    });

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

    const openConfirm = (title, message, onConfirm, type = "info") =>
        setConfirmState({ show: true, title, message, type, onConfirm });

    const closeConfirm = () =>
        setConfirmState((prev) => ({ ...prev, show: false }));

    if (!user || !user.role || !basePath) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Loading your dashboard...
            </div>
        );
    }

    useEffect(() => {
        document.documentElement.classList.remove("dark");
        localStorage.removeItem("theme");
    }, []);

    useEffect(() => {
        if (flash.success) {
            setToast({ type: "success", message: flash.success });
            setTimeout(() => setToast(null), 3000);
        } else if (flash.error) {
            setToast({ type: "error", message: flash.error });
            setTimeout(() => setToast(null), 3000);
        }
    }, [flash]);

    let menuItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, route: "/dashboard" },
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

    if (
        can.superadmin ||
        user?.is_super_admin ||
        (user?.role && user.role.toLowerCase() === "superadmin")
    ) {
        menuItems.push(
            {
                name: "Activity Log",
                icon: <FaChartLine />,
                route: "/superadmin/activity",
            },
            {
                name: "Manage Users",
                icon: <FaUserPlus />,
                route: "/superadmin/users",
            },
            {
                name: "System Control",
                icon: <FaCog className="text-red-600" />,
                route: "/superadmin/system",
                danger: true,
            },
        );
    }

    const avatar = user?.profile_photo_url
        ? user.profile_photo_url
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || "U",
          )}&background=random`;

    return (
        <ConfirmContext.Provider value={openConfirm}>
            <div className="flex bg-gray-50 text-gray-900">
                {toast && (
                    <div
                        className={`fixed top-5 right-5 px-5 py-3 rounded shadow-lg z-50 ${
                            toast.type === "success"
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* 📂 Sidebar */}
                <aside
                    className={`fixed top-0 left-0 h-screen z-40 overflow-y-auto transition-all duration-300 bg-white shadow-md ${
                        sidebarOpen ? "w-64" : "w-20"
                    } hidden md:flex flex-col`}
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
                                    <span className="text-gray-300 text-[13px] mt-[2px]">
                                        Micro-Credit
                                    </span>
                                </div>
                            )}
                        </Link>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-white hover:text-gray-200 p-2 rounded transition"
                            title="Toggle Sidebar"
                        >
                            <FaBars size={20} />
                        </button>
                    </div>

                    <nav className="mt-4 flex-1 bg-white">
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
                                    <span className="ml-4">{item.name}</span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* 📊 Main Content */}
                <div
                    className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
                        sidebarOpen ? "ml-64" : "ml-20"
                    }`}
                >
                    {/* 🔝 Top Navbar */}
                    <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-end items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 backdrop-blur-sm">
                                            <Link
                                                href={route("profile.edit")}
                                                className="block"
                                            >
                                                <img
                                                    src={avatar}
                                                    alt="Avatar"
                                                    className="h-8 w-8 rounded-full object-cover border border-gray-200 hover:opacity-90 transition"
                                                />
                                            </Link>
                                            <span>{user?.name || "User"}</span>
                                            <svg
                                                className="-me-0.5 ms-1 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    {/* ✨ Glassy dropdown */}
                                    <Dropdown.Content className="mt-2 w-44 rounded-lg shadow-lg bg-white/70 backdrop-blur-md ring-1 ring-gray-100 overflow-hidden border border-gray-100 transition-all">
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            ✏️ Edit Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                                        >
                                            🚪 Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </nav>

                    {/* Header */}
                    {header && (
                        <header className="bg-white shadow">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-gray-900">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="flex-1 overflow-y-auto p-6 text-gray-900">
                        {children}
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
