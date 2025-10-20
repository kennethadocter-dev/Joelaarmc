import { Link } from "@inertiajs/react";

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 px-4">
            {/* 🚫 Removed top logo completely */}

            {/* ✅ Form container (centered) */}
            <div className="w-full sm:max-w-md px-6 py-6 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-100 dark:border-gray-700">
                {children}
            </div>
        </div>
    );
}
