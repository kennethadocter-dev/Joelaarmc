import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    // FIXED: Use appSettings, not settings
    const { appSettings } = usePage().props;
    const companyName = appSettings?.app_name || "Joelaar Micro-Credit";

    const { data, setData, post, processing, errors, reset } = useForm({
        login: "", // unified field for email or username
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6 mt-16">
                {/* Logo & Welcome Message */}
                <div className="text-center mb-4">
                    <img
                        src="/logo.png"
                        alt="Company Logo"
                        className="mx-auto mb-3 w-20 h-20 object-contain"
                        onError={(e) => (e.target.style.display = "none")}
                    />
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Welcome to
                    </h1>
                    <h2 className="text-2xl font-bold text-black dark:text-gray-200 mt-1">
                        {companyName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Sign in to your account
                    </p>
                </div>

                {status && (
                    <div className="text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {/* Email or Username */}
                    <div>
                        <InputLabel htmlFor="login" value="Email or Username" />
                        <TextInput
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused
                            onChange={(e) => setData("login", e.target.value)}
                        />
                        <InputError message={errors.login} className="mt-2" />
                    </div>

                    {/* Password */}
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    {/* Remember me + Forgot password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                Remember me
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={processing}
                        >
                            {processing ? "Signing in..." : "Sign In"}
                        </PrimaryButton>
                    </div>

                    {(errors.login || errors.email) && (
                        <div className="text-red-600 text-center text-sm font-medium mt-3">
                            ⚠️ Invalid credentials. Please check your
                            email/username or password.
                        </div>
                    )}
                </form>

                {/* Footer Info */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-6">
                    Need an account?
                    <br />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        Please contact your system administrator.
                    </span>
                </div>
            </div>
        </GuestLayout>
    );
}
