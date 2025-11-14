import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { useEffect, useState } from "react";

export default function Edit({ mustVerifyEmail, status }) {
    const { props } = usePage();
    const guard = props?.auth?.guard || "web"; // detect if user is customer or admin/staff
    const user = props?.auth?.user || {};

    const [successMessage, setSuccessMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    // show flash success when Laravel flashes 'profile-updated'
    useEffect(() => {
        if (status === "profile-updated") {
            setSuccessMessage("Profile updated successfully!");
        }
    }, [status]);

    useEffect(() => {
        if (successMessage || passwordMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setPasswordMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, passwordMessage]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {guard === "customer" ? "My Profile" : "Profile Settings"}
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-5xl space-y-8 sm:px-6 lg:px-8">
                    {/* 🧍‍♂️ Update Profile Information */}
                    <section className="bg-white/90 backdrop-blur-md border border-gray-100 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition relative">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                            onSaved={() =>
                                setSuccessMessage("Saved successfully")
                            }
                        />
                        {successMessage && (
                            <div className="absolute top-4 right-6 bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-opacity duration-500">
                                {successMessage}
                            </div>
                        )}
                    </section>

                    {/* 🔒 Update Password */}
                    {guard !== "customer" && (
                        <section className="bg-white/90 backdrop-blur-md border border-gray-100 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition relative">
                            <UpdatePasswordForm
                                className="max-w-xl"
                                onUpdated={() =>
                                    setPasswordMessage("Password updated")
                                }
                            />
                            {passwordMessage && (
                                <div className="absolute top-4 right-6 bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-opacity duration-500">
                                    {passwordMessage}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
