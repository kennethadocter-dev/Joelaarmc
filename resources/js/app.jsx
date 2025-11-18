import "../css/app.css";
import "./bootstrap";

/* ----------------------------------------------
   ZIGGY ROUTING (GLOBAL route() HELPER)
------------------------------------------------*/
import { route as ziggyRoute } from "ziggy-js";
import { Ziggy as BaseZiggy } from "./ziggy";

// Build dynamic Ziggy config (fixes local/prod routing)
const Ziggy = {
    ...BaseZiggy,
    url: window.location.origin,
};

// Global route() helper
window.route = (name, params, absolute) =>
    ziggyRoute(name, params, absolute, Ziggy);

/* ----------------------------------------------
   INERTIA + REACT + TOAST SETUP
------------------------------------------------*/
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import toast, { Toaster } from "react-hot-toast";

// 🔥 Make toast globally available (used in your pages)
window.toast = toast;

// (Optional) disable noisy logs in production only
if (import.meta.env.MODE === "production") {
    // Comment these out if you’re debugging in production
    // console.log = () => {};
    // console.info = () => {};
    // console.warn = () => {};
}

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Auto-import all Inertia pages
const pages = import.meta.glob("./Pages/**/*.jsx");

// Normalize path automatically ("Admin/Customers/Index" → "Admin/Customers/Index.jsx")
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
        const key = `./Pages/${safe}.jsx`;

        if (!pages[key]) {
            console.error("❌ Inertia Page Not Found:", {
                requested: name,
                normalized: safe,
                expected: key,
                available: Object.keys(pages),
            });
            throw new Error(`Page not found: ${key}`);
        }

        return pages[key]();
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            background: "#333",
                            color: "#fff",
                            borderRadius: "10px",
                        },
                    }}
                />
            </>,
        );
    },

    progress: {
        color: "#4B5563",
        showSpinner: false,
    },
});
