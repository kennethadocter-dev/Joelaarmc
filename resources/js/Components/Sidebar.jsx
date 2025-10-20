import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { FaTachometerAlt, FaFileInvoiceDollar, FaUsers, FaChartBar, FaCog } from "react-icons/fa";

export default function Sidebar() {
    // Get current URL to highlight the active link
    const { url } = usePage();

    // Sidebar menu items
    const menuItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, route: "/dashboard" },
        { name: "Loans", icon: <FaFileInvoiceDollar />, route: "/loans" },
        { name: "Customers", icon: <FaUsers />, route: "/customers" },
        { name: "Reports", icon: <FaChartBar />, route: "/reports" },
        { name: "Settings", icon: <FaCog />, route: "/settings" },
    ];

    return (
        <aside className="w-64 bg-white h-screen shadow-md hidden md:block">
            {/* Logo / Brand */}
            <div className="p-6 font-bold text-xl text-blue-600">LoanApp</div>

            {/* Navigation */}
            <nav className="mt-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.route}
                        className={`flex items-center p-3 my-2 rounded hover:bg-blue-100 transition ${
                            url.includes(item.route) ? "bg-blue-100 font-semibold" : ""
                        }`}
                    >
                        <span className="text-lg mr-3">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}