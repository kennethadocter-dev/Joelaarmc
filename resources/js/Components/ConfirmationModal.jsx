import React from "react";

export default function ConfirmationModal({
    open,
    title,
    message,
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm p-6 text-center border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                    {title || "Are you sure?"}
                </h2>
                <p className="text-gray-600 mt-2">{message}</p>

                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
