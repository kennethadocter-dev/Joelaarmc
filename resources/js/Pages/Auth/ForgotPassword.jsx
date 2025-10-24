import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function ForgotPassword({ status }) {
    const { role, pageTitle } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(
            route(
                `${role === "user" ? "password.email" : `${role}.password.email`}`,
            ),
        );
    };

    // ✨ Custom messages per role
    const introMessage = (() => {
        switch (role) {
            case "superadmin":
                return "Enter your Superadmin email to receive a secure reset link.";
            case "admin":
                return "Enter your Admin/Staff email address to get your password reset link.";
            case "customer":
                return "Please provide the email you used to register your account. We'll send a reset link.";
            default:
                return "Forgot your password? No problem. Enter your email and we'll send a reset link.";
        }
    })();

    return (
        <GuestLayout>
            <Head title={pageTitle || "Forgot Password"} />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                {introMessage}
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData("email", e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {processing
                            ? "Sending..."
                            : "Email Password Reset Link"}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
