import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FaBars,
    FaTachometerAlt,
    FaUsers,
    FaMoneyBillWave,
    FaChartLine,
    FaCog,
    FaFileAlt,
    FaServer,
} from "react-icons/fa";

export default function Sidebar() {
    const { auth, url } = usePage().props;
    const role = auth?.user?.role?.toLowerCase() || "";

    // ─────────────────────────────────────
    // Collapsed state (remembered in localStorage)
    // ─────────────────────────────────────
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

    // ─────────────────────────────────────
    // Helpers to compare URLs safely
    // ─────────────────────────────────────
    const clean = (path) => (path || "").replace(/^\//, "");
    const current = clean(url); // e.g. "admin/customers"

    // ─────────────────────────────────────
    // Link definitions
    // ─────────────────────────────────────
    const baseLinks = [
        {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            href:
                role === "superadmin"
                    ? route("superadmin.dashboard")
                    : route("admin.dashboard"),
        },
        {
            name: "Customers",
            icon: <FaUsers />,
            href:
                role === "superadmin"
                    ? route("superadmin.customers.index")
                    : route("admin.customers.index"),
        },
        {
            name: "Loans",
            icon: <FaMoneyBillWave />,
            href:
                role === "superadmin"
                    ? route("superadmin.loans.index")
                    : route("admin.loans.index"),
        },
        {
            name: "Reports",
            icon: <FaFileAlt />,
            href:
                role === "superadmin"
                    ? route("superadmin.reports.index")
                    : route("admin.reports.index"),
        },
        {
            name: "Settings",
            icon: <FaCog />,
            href:
                role === "superadmin"
                    ? route("superadmin.settings.index")
                    : route("admin.settings.index"),
        },
    ];

    const superadminExtras = [
        {
            name: "Activity Logs",
            icon: <FaChartLine />,
            href: route("superadmin.activity.index"),
        },
        {
            name: "Manage Users",
            icon: <FaUsers />,
            href: route("superadmin.users.index"),
        },
        {
            name: "Manage Customers",
            icon: <FaUsers />,
            href: route("superadmin.manage-customers.index"),
        },
        {
            name: "System Control",
            icon: <FaServer />,
            href: route("superadmin.system.index"),
        },
    ];

    const links =
        role === "superadmin" ? [...baseLinks, ...superadminExtras] : baseLinks;

    return (
        <aside
            className={`${
                collapsed ? "w-20" : "w-64"
            } h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 shadow-xl flex flex-col transition-all duration-300 overflow-hidden`}
        >
            {/* HEADER: Logo + Toggle */}
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

            {/* MENU */}
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {links.map((item) => {
                    const href = item.href || "#";

                    // If it's an absolute URL, strip origin first
                    let hrefPath = href;
                    if (
                        typeof window !== "undefined" &&
                        href.startsWith("http")
                    ) {
                        hrefPath = href.replace(window.location.origin, "");
                    }

                    hrefPath = clean(hrefPath); // "admin/customers" etc.

                    const active =
                        hrefPath === current || current.startsWith(hrefPath);

                    return (
                        <Link
                            key={item.name}
                            href={href}
                            className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                active
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "hover:bg-gray-700 hover:text-white"
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

            {/* FOOTER */}
            <div className="p-3 border-t border-gray-700 text-xs text-center text-gray-400">
                {!collapsed && <>© {new Date().getFullYear()} Joelaar</>}
            </div>
        </aside>
    );
}
