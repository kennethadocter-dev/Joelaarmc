import "../css/app.css";
import "./bootstrap";

import { Ziggy } from "./ziggy";
import { route } from "ziggy-js";

window.route = (name, params, absolute) => route(name, params, absolute, Ziggy);

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

if (import.meta.env.MODE === "production") {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
}

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

const pages = import.meta.glob("./Pages/**/*.jsx");

function normalizePath(name) {
    return name
        .split("/")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("/");
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) => {
        const safeName = normalizePath(name);
        const key = `./Pages/${safeName}.jsx`;

        if (!pages[key]) {
            console.error("❌ Inertia Page Not Found:", {
                requested: name,
                normalized: safeName,
                expectedKey: key,
                available: Object.keys(pages),
            });
            throw new Error(`Page not found: ${key}`);
        }

        return pages[key]();
    },

    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
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
    },
});
