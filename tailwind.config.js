import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    // ✅ Updated: no more warning, still stays in light mode permanently
    darkMode: "class",

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
                background: "#f9fafb",
                surface: "#ffffff",

                // Default text shades
                text: {
                    DEFAULT: "#111111",
                    muted: "#333333",
                    light: "#ffffff", // ✅ white text for dark backgrounds
                },

                // Sidebar and surfaces
                sidebar: {
                    bg: "#ffffff",
                    text: "#111111",
                    active: "#2563eb",
                },

                // Main color palette with automatic contrast
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
                    contrast: "#111111", // ⚠️ black text works better on yellow
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

            boxShadow: {
                soft: "0 2px 6px rgba(0,0,0,0.08)",
                mdsoft: "0 4px 10px rgba(0,0,0,0.1)",
            },

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
        },
    },

    plugins: [forms],
};
