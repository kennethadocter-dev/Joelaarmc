// resources/js/Components/ProcessingOverlay.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🌀 Global Processing Overlay
 * Trigger with:
 *   window.dispatchEvent(new CustomEvent('processing:start', { detail: 'Saving Loan...' }));
 * Hide with:
 *   window.dispatchEvent(new Event('processing:stop'));
 */
export default function ProcessingOverlay() {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("Processing...");

    useEffect(() => {
        const startHandler = (e) => {
            setMessage(e.detail || "Processing...");
            setVisible(true);
        };
        const stopHandler = () => setVisible(false);

        window.addEventListener("processing:start", startHandler);
        window.addEventListener("processing:stop", stopHandler);

        return () => {
            window.removeEventListener("processing:start", startHandler);
            window.removeEventListener("processing:stop", stopHandler);
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center 
                               bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 
                               bg-opacity-90 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center"
                    >
                        <img
                            src="/images/logo.png"
                            alt="Company Logo"
                            className="h-20 w-auto mb-6 animate-pulse drop-shadow-lg"
                            onError={(e) => (e.target.style.display = "none")}
                        />
                        <div className="loader mb-4"></div>
                        <p className="text-white text-lg font-semibold tracking-wide">
                            {message}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ------------------------------------------
   🎨 Spinner CSS (auto-injected globally)
--------------------------------------------- */
const style = document.createElement("style");
style.innerHTML = `
.loader {
  border: 5px solid rgba(255,255,255,0.3);
  border-top: 5px solid #fff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
