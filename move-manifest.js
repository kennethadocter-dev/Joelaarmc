// move-manifest.js — final version
import { renameSync, existsSync, mkdirSync, copyFileSync } from "fs";

const oldPath = "public/build/.vite/manifest.json";
const newPath = "public/build/manifest.json";

// Ensure destination exists
mkdirSync("public/build", { recursive: true });

try {
    if (existsSync(oldPath)) {
        copyFileSync(oldPath, newPath); // copy instead of move (safe for Render)
        console.log("✅ Copied manifest.json from .vite to public/build/");
    } else if (existsSync(newPath)) {
        console.log("✅ Manifest already in correct location.");
    } else {
        console.error("❌ No manifest.json found in either location!");
    }
} catch (err) {
    console.error("⚠️ Error copying manifest:", err);
}
