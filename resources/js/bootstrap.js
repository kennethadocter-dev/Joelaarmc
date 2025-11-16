import axios from "axios";
window.axios = axios;

// Detect environment correctly
const IS_PRODUCTION =
    window.location.hostname !== "127.0.0.1" &&
    window.location.hostname !== "localhost";

// Force correct backend URL
window.axios.defaults.baseURL = IS_PRODUCTION
    ? "https://joelaarmc.com" // Live server
    : "http://127.0.0.1:8000"; // Local dev

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

        // If backend returned HTML (means logged out)
        if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
            console.warn(
                "⚠️ CSRF refresh returned HTML — probably logged out.",
            );
            return;
        }

        const data = JSON.parse(text);
        const csrf = data.csrfToken || data.csrf;

        if (!csrf) return;

        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
        const meta = document.querySelector('meta[name=\"csrf-token\"]');
        if (meta) meta.setAttribute("content", csrf);

        console.log("🔄", label);
    } catch {
        console.warn("⚠️ CSRF refresh failed silently");
    }
}

setInterval(() => refreshCsrfToken("auto-refresh"), 600000);

document.addEventListener("inertia:navigate", () =>
    refreshCsrfToken("navigation refresh"),
);

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
