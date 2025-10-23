import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

// ============================================================
// ✅ FIXED VITE CONFIG — Laravel + React (no more .vite folder)
// ============================================================

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],

    build: {
        manifest: true,
        outDir: "public/build",
        emptyOutDir: true,
        rollupOptions: {
            input: ["resources/js/app.jsx", "resources/css/app.css"],
            output: {
                // 👇 Force manifest and assets to go directly under /public/build
                assetFileNames: "assets/[name]-[hash][extname]",
                chunkFileNames: "assets/[name]-[hash].js",
                entryFileNames: "assets/[name]-[hash].js",
            },
        },
    },

    server: {
        host: "0.0.0.0",
        port: 5173,
    },

    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
});
