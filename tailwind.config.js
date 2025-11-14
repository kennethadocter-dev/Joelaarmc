import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class", // stays in light mode unless toggled manually

    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
        "./resources/js/**/*.js",
        "./resources/js/**/*.tsx",
        "./resources/js/**/*.ts",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },

            colors: {
                // 🌤 Backgrounds and Surfaces
                background: "#f9fafb",
                surface: "#ffffff",

                // 🖋 Text shades
                text: {
                    DEFAULT: "#111111",
                    muted: "#333333",
                    light: "#ffffff",
                },

                // 🧭 Sidebar theme
                sidebar: {
                    bg: "#ffffff",
                    text: "#111111",
                    active: "#2563eb",
                },

                // 🎨 Main brand palette
                primary: {
                    DEFAULT: "#4f46e5",
                    hover: "#4338ca",
                    contrast: "#ffffff",
                },
                success: {
                    DEFAULT: "#16a34a",
                    hover: "#15803d",
                    contrast: "#ffffff",
                },
                danger: {
                    DEFAULT: "#dc2626",
                    hover: "#b91c1c",
                    contrast: "#ffffff",
                },
                warning: {
                    DEFAULT: "#f59e0b",
                    hover: "#d97706",
                    contrast: "#111111",
                },
                info: {
                    DEFAULT: "#2563eb",
                    hover: "#1d4ed8",
                    contrast: "#ffffff",
                },
                dark: {
                    DEFAULT: "#111827",
                    hover: "#0f172a",
                    contrast: "#ffffff",
                },
            },

            // 🌫 Softer shadows for modern flat UI
            boxShadow: {
                soft: "0 2px 6px rgba(0,0,0,0.08)",
                mdsoft: "0 4px 10px rgba(0,0,0,0.1)",
            },

            // 📏 Responsive container breakpoints
            container: {
                center: true,
                padding: "1rem",
                screens: {
                    sm: "600px",
                    md: "728px",
                    lg: "984px",
                    xl: "1240px",
                },
            },

            // 🚫 Restrict transitions globally (base safety)
            transitionProperty: {
                colors: "background-color, border-color, color, fill, stroke",
            },
        },
    },

    plugins: [
        forms,

        // 🧩 Global transition and rendering optimization plugin (modified)
        function ({ addBase }) {
            addBase({
                "*, ::before, ::after": {
                    transitionProperty:
                        "background-color, border-color, color, fill, stroke",
                    transitionTimingFunction: "ease-in-out",
                    transitionDuration: "150ms",
                    backfaceVisibility: "hidden",
                    transform: "translateZ(0)",
                },

                /* ✅ Brighten white text inside dark areas */
                ".bg-gray-800 *, .bg-gray-900 *": {
                    color: "#ffffff !important",
                    opacity: "1 !important",
                    filter: "brightness(1.3)",
                    WebkitFontSmoothing: "auto !important", // restore crisp edges
                },
            });
        },
    ],
};
