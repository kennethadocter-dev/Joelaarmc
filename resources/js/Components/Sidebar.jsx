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

    const baseLinks = [
        {
            name: "Dashboard",
            routeName:
                role === "superadmin"
                    ? "superadmin.dashboard"
                    : "admin.dashboard",
            icon: <FaTachometerAlt />,
            href:
                role === "superadmin"
                    ? route("superadmin.dashboard")
                    : route("admin.dashboard"),
        },
        {
            name: "Customers",
            routeName:
                role === "superadmin"
                    ? "superadmin.customers.index"
                    : "admin.customers.index",
            icon: <FaUsers />,
            href:
                role === "superadmin"
                    ? route("superadmin.customers.index")
                    : route("admin.customers.index"),
        },
        {
            name: "Loans",
            routeName:
                role === "superadmin"
                    ? "superadmin.loans.index"
                    : "admin.loans.index",
            icon: <FaMoneyBillWave />,
            href:
                role === "superadmin"
                    ? route("superadmin.loans.index")
                    : route("admin.loans.index"),
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
                    ? route("superadmin.reports.index")
                    : route("admin.reports.index"),
        },
        {
            name: "Settings",
            routeName:
                role === "superadmin"
                    ? "superadmin.settings.index"
                    : "admin.settings.index",
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
            routeName: "superadmin.activity.index",
            icon: <FaChartLine />,
            href: route("superadmin.activity.index"),
        },
        {
            name: "Manage Users",
            routeName: "superadmin.users.index",
            icon: <FaUsers />,
            href: route("superadmin.users.index"),
        },
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
            href: route("superadmin.system.index"),
        },
    ];

    const links =
        role === "superadmin" ? [...baseLinks, ...superadminExtras] : baseLinks;

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-64"}
                h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 
                shadow-xl flex flex-col transition-all duration-300 overflow-hidden`}
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

                    let hrefPath = clean(
                        href.startsWith("http")
                            ? href.replace(window.location.origin, "")
                            : href,
                    );

                    const isActive =
                        route().current(item.routeName) ||
                        current === hrefPath ||
                        current.startsWith(hrefPath);

                    return (
                        <Link
                            key={item.name}
                            href={href}
                            className={`flex items-center gap-3 p-3 rounded-lg relative transition-all duration-200 
                                focus:outline-none
                                hover:text-white active:text-white focus:text-white
                                hover:bg-gray-700 active:bg-gray-700 focus:bg-gray-700
                                
                                ${
                                    isActive
                                        ? `bg-gradient-to-r from-[#7a0000] via-[#b30000] to-[#ff1a1a] 
                                           text-white shadow-[0_0_12px_rgba(255,0,0,0.5)]
                                           scale-[1.03]
                                           before:absolute before:inset-0 before:bg-white/10 before:rounded-lg`
                                        : ""
                                }`}
                        >
                            <span className="text-xl relative z-10">
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <span className="font-medium relative z-10">
                                    {item.name}
                                </span>
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
