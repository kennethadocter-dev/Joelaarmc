import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";

export default function EditCustomer({ customer, auth }) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        community: customer.community || "",
        status: customer.status || "active",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/superadmin/customers/${customer.id}`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Edit Customer
                </h2>
            }
        >
            <Head title="Edit Customer" />

            <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={(e) =>
                                setData("full_name", e.target.value)
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-2"
                        />
                        {errors.full_name && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.full_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            className="mt-1 w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Community
                        </label>
                        <input
                            type="text"
                            value={data.community}
                            onChange={(e) =>
                                setData("community", e.target.value)
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="mt-1 w-full border rounded-lg px-3 py-2"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Link
                            href="/superadmin/customers"
                            className="text-gray-600 hover:underline text-sm"
                        >
                            ← Back to Customers
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
