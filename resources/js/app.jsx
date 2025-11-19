import "../css/app.css";
import "./bootstrap";

/* ----------------------------------------------
   ZIGGY ROUTING
------------------------------------------------*/
import { route as ziggyRoute } from "ziggy-js";
import { Ziggy as BaseZiggy } from "./ziggy";

const Ziggy = {
    ...BaseZiggy,
    url: window.location.origin,
};

window.route = (name, params, absolute) =>
    ziggyRoute(name, params, absolute, Ziggy);

/* ----------------------------------------------
   INERTIA + TOAST SETUP
------------------------------------------------*/
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import toast, { Toaster } from "react-hot-toast";
window.toast = toast;

/* ----------------------------------------------
   GLOBAL CONFIRM PROVIDER
------------------------------------------------*/
import React, { useState, createContext, useContext } from "react";

export const ConfirmContext = createContext(null);

export function useConfirm() {
    return useContext(ConfirmContext);
}

function ConfirmProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        title: "",
        message: "",
        type: "warning",
        onConfirm: null,
    });

    const confirm = (title, message, onConfirm, type = "warning") => {
        setState({
            open: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const close = () => setState((prev) => ({ ...prev, open: false }));

    const Dialog = state.open ? (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[90%] max-w-md">
                <h2 className="text-xl font-semibold">{state.title}</h2>
                <p className="mt-3">{state.message}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={close}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            close();
                            state.onConfirm?.();
                        }}
                        className={`px-4 py-2 rounded text-white ${
                            state.type === "danger"
                                ? "bg-red-600"
                                : "bg-blue-600"
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {Dialog}
        </ConfirmContext.Provider>
    );
}

/* ---------------------------------------------- */
const appName = import.meta.env.VITE_APP_NAME || "Laravel";
const pages = import.meta.glob("./Pages/**/*.jsx");

function normalizePath(name) {
    return name
        .split("/")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("/");
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const safe = normalizePath(name);
        return pages[`./Pages/${safe}.jsx`]();
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <ConfirmProvider>
                <App {...props} />
                <Toaster position="top-right" />
            </ConfirmProvider>,
        );
    },

    progress: {
        color: "#4B5563",
        showSpinner: false,
    },
});
