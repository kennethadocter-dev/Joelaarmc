import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// ============================================================
// ✅ FINAL VITE CONFIG — Laravel + React (Render / Production)
// ============================================================

export default defineConfig(({ command }) => ({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],

    // ✅ Ensure correct base path for assets in production
    base: command === "build" ? "/build/" : "/",

    // ✅ Development server (only runs locally, ignored on Render)
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
        https: false, // Render handles HTTPS automatically
        watch: {
            usePolling: true,
        },
    },

    // ✅ Production build configuration
    build: {
        manifest: true, // generates manifest.json (for Laravel)
        outDir: "public/build", // build output path
        emptyOutDir: true, // clean before new build
        rollupOptions: {
            input: {
                app: resolve(__dirname, "resources/js/app.jsx"),
            },
        },
    },

    // ✅ Path alias for cleaner imports
    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },

    // ✅ Cleaner logs
    logLevel: "info",
}));
