import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ type = "info", message = "", onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible || !message) return null;

    const colorMap = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-gray-700",
    };

    const iconMap = {
        success: "✅",
        error: "⚠️",
        info: "ℹ️",
    };

    const bgColor = colorMap[type] || colorMap.info;
    const icon = iconMap[type] || iconMap.info;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.3 }}
                    className={`${bgColor} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3`}
                >
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium">{message}</span>
                    <button
                        onClick={() => {
                            setVisible(false);
                            onClose?.();
                        }}
                        className="ml-3 text-white/80 hover:text-white font-bold text-lg leading-none"
                    >
                        ×
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
