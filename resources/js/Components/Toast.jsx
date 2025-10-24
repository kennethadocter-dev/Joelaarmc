import React, { useEffect, useState } from "react";

export default function Toast({ type, message }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible || !message) return null;

    const bgColor =
        type === "success"
            ? "bg-green-600"
            : type === "error"
              ? "bg-red-600"
              : "bg-gray-700";

    return (
        <div
            className={`${bgColor} fixed bottom-6 right-6 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all`}
        >
            {message}
        </div>
    );
}
