import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function EditUser() {
    const { basePath = "admin", user: userData } = usePage().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        role: userData?.role || "user",
        password: "",
        password_confirmation: "",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [toastColor, setToastColor] = useState("bg-green-600");

    /** 🔄 Save Changes */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.password && data.password !== data.password_confirmation) {
            setToast("⚠️ Passwords do not match!");
            setToastColor("bg-red-600");
            setTimeout(() => setToast(null), 2500);
            return;
        }

        put(route(`${basePath}.users.update`, userData.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset("password", "password_confirmation");
                setToast("✅ User updated successfully!");
                setToastColor("bg-green-600");
                setTimeout(() => setToast(null), 2500);
            },
            onError: () => {
                setToast("⚠️ Failed to update user.");
                setToastColor("bg-red-600");
                setTimeout(() => setToast(null), 2500);
            },
        });
    };

    /** 🗑️ Delete user */
    const confirmDelete = () => {
        router.delete(route(`${basePath}.users.destroy`, userData.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setToast("🗑️ User deleted successfully!");
                setToastColor("bg-green-600");
                setTimeout(() => {
                    setToast(null);
                    router.visit(route(`${basePath}.users.index`));
                }, 2000);
            },
            onError: () => {
                setShowDeleteModal(false);
                setToast("❌ Failed to delete user.");
                setToastColor("bg-red-600");
                setTimeout(() => setToast(null), 2500);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Edit User
                </h2>
            }
        >
            <Head title={`Edit ${userData?.name || "User"}`} />

            {/* ✅ Toast */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-50 ${toastColor} text-white px-4 py-3 rounded-lg shadow-lg transition-opacity duration-300`}
                >
                    {toast}
                </div>
            )}

            {/* 🔹 Main Card */}
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Edit User
                    </h2>
                    <Link
                        href={route(`${basePath}.users.index`)}
                        className="text-blue-600 hover:underline"
                    >
                        ← Back
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 👤 Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* 📞 Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 0541234567 or 233541234567"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* 📧 Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* 🏷️ Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    {/* 🔒 Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            New Password (optional)
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="Leave blank to keep current password"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* 🔁 Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            placeholder="Re-enter new password"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    {/* ✅ Submit + Delete */}
                    <div className="pt-4 flex justify-between items-center border-t mt-6 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        >
                            Delete User
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* 🧩 Custom Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">
                                {userData.name}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
