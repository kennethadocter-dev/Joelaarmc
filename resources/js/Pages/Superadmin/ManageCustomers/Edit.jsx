import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FaArrowLeft } from "react-icons/fa";

export default function Edit() {
    const { customer } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Edit Customer
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
            <div className="max-w-3xl mx-auto bg-white border shadow-sm rounded-lg p-6 mt-4">
                <h3 className="text-md font-medium mb-4">Customer Details</h3>

                <div className="space-y-4 text-gray-800">
                    <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold">
                            {customer.full_name}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p>{customer.email || "—"}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p>{customer.phone || "—"}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="capitalize">{customer.status}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Created At</p>
                        <p>
                            {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
