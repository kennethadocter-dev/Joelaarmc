import React from "react";
import { Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendar,
} from "react-icons/fa";

export default function Show() {
    const { customer } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Customer Details
                    </h2>

                    <Link
                        href={route("superadmin.manage-customers.index")}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm transition"
                    >
                        <FaArrowLeft /> Back
                    </Link>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-100 rounded-lg p-6 mt-4">
                {/* BASIC INFO */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                        <FaUser className="text-xl text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {customer.full_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <FaEnvelope className="text-xl text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-gray-900">
                                {customer.email || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <FaPhone className="text-xl text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-gray-900">
                                {customer.phone || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <FaCalendar className="text-xl text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Created On</p>
                            <p className="text-gray-900">
                                {new Date(
                                    customer.created_at,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* STATUS */}
                <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Account Status
                    </h3>

                    <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                            customer.status === "active"
                                ? "bg-green-600"
                                : customer.status === "inactive"
                                  ? "bg-gray-600"
                                  : "bg-yellow-600"
                        }`}
                    >
                        {customer.status}
                    </span>
                </div>

                {/* EDIT BUTTON */}
                <div className="mt-8 flex justify-end">
                    <Link
                        href={route(
                            "superadmin.manage-customers.edit",
                            customer.id,
                        )}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                    >
                        Edit Customer
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
