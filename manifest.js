// move-manifest.js
import { renameSync, existsSync } from "fs";

const oldPath = "public/build/.vite/manifest.json";
const newPath = "public/build/manifest.json";

if (existsSync(oldPath)) {
    renameSync(oldPath, newPath);
    console.log("✅ Moved manifest.json to public/build/");
} else {
    console.error("⚠️ No manifest found at .vite/, skipping move.");
}
