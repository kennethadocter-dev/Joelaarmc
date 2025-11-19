import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FaBars,
    FaTachometerAlt,
    FaUsers,
    FaMoneyBillWave,
    FaFileAlt,
    FaCog,
    FaChartLine,
    FaServer,
} from "react-icons/fa";

/* ======================================
   SAFE ROUTE WRAPPER (for non-critical links)
======================================= */
function safeRoute(name, params = {}) {
    try {
        return route(name, params);
    } catch (e) {
        console.warn("Missing route:", name);
        return "#";
    }
}

/* ======================================
   Sidebar Component
======================================= */
export default function Sidebar() {
    const { auth, url } = usePage().props;
    const role = auth?.user?.role?.toLowerCase() || "";

    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("sidebar-collapsed") === "1";
    });

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        if (typeof window !== "undefined") {
            localStorage.setItem("sidebar-collapsed", newState ? "1" : "0");
        }
    };

    const clean = (path) => (path || "").replace(/^\//, "");
    const current = clean(url);

    /* ==========================
       Base Links (Both Roles)
    =========================== */
    const baseLinks = [
        {
            name: "Dashboard",
            routeName:
                role === "superadmin"
                    ? "superadmin.dashboard"
                    : "admin.dashboard",
            icon: <FaTachometerAlt />,
            href: safeRoute(
                role === "superadmin"
                    ? "superadmin.dashboard"
                    : "admin.dashboard",
            ),
        },
        {
            name: "Customers",
            routeName:
                role === "superadmin"
                    ? "superadmin.customers.index"
                    : "admin.customers.index",
            icon: <FaUsers />,
            href: safeRoute(
                role === "superadmin"
                    ? "superadmin.customers.index"
                    : "admin.customers.index",
            ),
        },
        {
            name: "Loans",
            routeName:
                role === "superadmin"
                    ? "superadmin.loans.index"
                    : "admin.loans.index",
            icon: <FaMoneyBillWave />,
            href: safeRoute(
                role === "superadmin"
                    ? "superadmin.loans.index"
                    : "admin.loans.index",
            ),
        },
        {
            name: "Reports",
            routeName:
                role === "superadmin"
                    ? "superadmin.reports.index"
                    : "admin.reports.index",
            icon: <FaFileAlt />,
            href:
                role === "superadmin"
                    ? route("superadmin.reports.index") // 🔥 FIXED for superadmin
                    : route("admin.reports.index"),
        },
        {
            name: "Settings",
            routeName:
                role === "superadmin"
                    ? "superadmin.settings.index"
                    : "admin.settings.index",
            icon: <FaCog />,
            href: safeRoute(
                role === "superadmin"
                    ? "superadmin.settings.index"
                    : "admin.settings.index",
            ),
        },
    ];

    /* ==========================
       Superadmin Exclusive Links
    =========================== */
    const superadminExtras = [
        {
            name: "Activity Logs",
            routeName: "superadmin.activity.index",
            icon: <FaChartLine />,
            href: safeRoute("superadmin.activity.index"),
        },
        {
            name: "Manage Users",
            routeName: "superadmin.users.index",
            icon: <FaUsers />,
            href: safeRoute("superadmin.users.index"),
        },

        /* 
        ===============================================
        🚀 FIXED: Manage Customers MUST use route(), 
        NOT safeRoute(), otherwise it becomes "#" 
        ===============================================
        */
        {
            name: "Manage Customers",
            routeName: "superadmin.manage-customers.index",
            icon: <FaUsers />,
            href: route("superadmin.manage-customers.index"),
        },

        {
            name: "System Control",
            routeName: "superadmin.system.index",
            icon: <FaServer />,
            href: safeRoute("superadmin.system.index"),
        },
    ];

    const links =
        role === "superadmin" ? [...baseLinks, ...superadminExtras] : baseLinks;

    /* ======================================
       Render Sidebar
    ======================================= */
    return (
        <aside
            className={`${
                collapsed ? "w-20" : "w-64"
            } h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 
            shadow-xl flex flex-col transition-all duration-300 overflow-hidden z-40`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" className="w-10 h-10" />

                    {!collapsed && (
                        <div className="flex flex-col leading-tight">
                            <span className="text-xl font-bold text-white">
                                Joelaar
                            </span>
                            <span className="text-[11px] text-gray-300">
                                Micro-Credit
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={toggleSidebar}
                    className="text-gray-300 hover:text-white"
                >
                    <FaBars size={20} />
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {links.map((item) => {
                    const href = item.href || "#";

                    let isActive = false;
                    try {
                        isActive = route().current(item.routeName);
                    } catch {}

                    return (
                        <Link
                            key={item.name}
                            href={href}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all 
                                hover:text-white hover:bg-gray-700
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-[#7a0000] via-[#b30000] to-[#ff1a1a] text-white shadow-lg scale-[1.03]"
                                        : ""
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {!collapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700 text-xs text-center text-gray-400">
                {!collapsed && <>© {new Date().getFullYear()} Joelaar</>}
            </div>
        </aside>
    );
}
