import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible || !message) return null;

    return (
        <div
            className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-semibold transition-opacity ${
                type === "error"
                    ? "bg-red-600"
                    : type === "warning"
                      ? "bg-yellow-500"
                      : "bg-green-600"
            }`}
        >
            {message}
        </div>
    );
}
