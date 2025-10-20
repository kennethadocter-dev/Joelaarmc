import { Head, Link } from "@inertiajs/react";

export default function Error404() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
            <Head title="Page Not Found" />
            
            <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                😕 Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                The page you are looking for doesn’t exist or has been moved. Please check the URL or go back to the dashboard.
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