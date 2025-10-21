import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: "0.0.0.0",
        https: true, // ✅ ensure all dev/production URLs use HTTPS
    },
    build: {
        manifest: true,
        outDir: "public/build",
        emptyOutDir: true,
    },
});
