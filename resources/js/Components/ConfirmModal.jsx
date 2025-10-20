import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
    show,
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full p-6"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-gray-600 text-sm">{message}</p>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold transition"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
