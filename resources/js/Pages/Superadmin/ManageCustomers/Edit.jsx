import React, { useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import AuthenticatedLayout, { useConfirm } from "@/Layouts/AuthenticatedLayout";
import { FaSave, FaArrowLeft, FaPaperPlane } from "react-icons/fa";

export default function Edit() {
    const { props } = usePage();
    const { customer, flash = {} } = props;

    const confirm = useConfirm();
    const [form, setForm] = useState({
        full_name: customer.full_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        status: customer.status || "active",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.put(
            route("superadmin.manage-customers.update", customer.id),
            form,
            {
                preserveScroll: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleResend = () => {
        confirm(
            "Resend Credentials",
            `Are you sure you want to resend login credentials to ${customer.full_name}?`,
            () => {
                router.post(
                    route("superadmin.manage-customers.resend", customer.id),
                );
            },
            "info",
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Edit Customer Login
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
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 🧍 Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* 📧 Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="example@email.com"
                        />
                    </div>

                    {/* 📱 Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone || ""}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="233xxxxxxxxx"
                        />
                    </div>

                    {/* ⚙️ Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Account Status
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    {/* 🔐 Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* 💾 Buttons */}
                    <div className="flex flex-wrap justify-between items-center mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium transition ${
                                loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            <FaSave />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                        >
                            <FaPaperPlane /> Resend Credentials
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
