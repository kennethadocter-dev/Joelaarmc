import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx", "resources/css/app.css"],
            refresh: true,
        }),
        react(),
    ],

    // -------------------------------------------------------
    // BASE PATH
    // -------------------------------------------------------
    // In DEV → "/"
    // In BUILD → "/build/"
    base: command === "build" ? "/build/" : "/",

    // -------------------------------------------------------
    // BUILD CONFIG
    // -------------------------------------------------------
    build: {
        outDir: "public/build",
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name]-[hash].js",
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
    },

    // -------------------------------------------------------
    // DEV SERVER (LOCAL HOST)
    // -------------------------------------------------------
    server: {
        host: "127.0.0.1",
        port: 5173, // Your dev server
        strictPort: true,
        hmr: {
            host: "127.0.0.1",
        },
    },
}));
