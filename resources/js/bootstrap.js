/**
 * Proper CSRF refresh that NEVER throws JSON errors.
 */

import axios from "axios";
window.axios = axios;

// Detect environment:
const IS_PRODUCTION =
    window.location.hostname !== "127.0.0.1" &&
    window.location.hostname !== "localhost";

// Set backend URL
window.axios.defaults.baseURL = IS_PRODUCTION
    ? "https://joelaarmc.com"
    : "http://127.0.0.1:8000";

window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// ---------------- Load token from <meta> ----------------
function loadCsrfFromMeta() {
    const tag = document.querySelector('meta[name="csrf-token"]');
    if (!tag) return null;
    const token = tag.content;
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
    return token;
}

loadCsrfFromMeta();

// ---------------- Safe Refresh Function ----------------
async function refreshCsrfToken(label = "CSRF refreshed") {
    try {
        const res = await fetch("/csrf-check", {
            credentials: "include",
            headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        const text = await res.text();

        // If backend returned HTML, abort safely (user not logged in)
        if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
            console.warn(
                "⚠️ CSRF refresh returned HTML — probably logged out.",
            );
            return;
        }

        const data = JSON.parse(text);
        const csrf = data.csrfToken || data.csrf;

        if (!csrf) return;

        // Update axios + meta tag
        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) meta.setAttribute("content", csrf);

        console.log("🔄", label);
    } catch (err) {
        console.warn("⚠️ CSRF refresh failed silently");
    }
}

// ----------- Auto refresh every 10 minutes -----------
setInterval(() => refreshCsrfToken("auto-refresh"), 600000);

// ----------- Refresh on Inertia navigation -----------
document.addEventListener("inertia:navigate", () =>
    refreshCsrfToken("navigation refresh"),
);

// ----------- Auto-recover 419 errors -----------
window.axios.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 419) {
            await refreshCsrfToken("retry after 419");
            return window.axios(error.config);
        }
        return Promise.reject(error);
    },
);

console.log("✅ CSRF protection loaded");
