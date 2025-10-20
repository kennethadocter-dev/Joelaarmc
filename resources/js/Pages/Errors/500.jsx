import { Head, Link } from "@inertiajs/react";

export default function Error500() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
            <Head title="Server Error" />
            
            <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                💥 Server Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Something went wrong on our end. Please try again later or contact support if the issue persists.
            </p>

            <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                ⬅ Back to Dashboard
            </Link>
        </div>
    );
}