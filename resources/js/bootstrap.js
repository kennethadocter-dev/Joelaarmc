import axios from "axios";
window.axios = axios;

// Detect production correctly
const IS_PRODUCTION =
    window.location.hostname !== "127.0.0.1" &&
    window.location.hostname !== "localhost";

// Backend API endpoint
window.axios.defaults.baseURL = IS_PRODUCTION
    ? "https://joelaarmc.com"
    : "http://127.0.0.1:8000";

// Important
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Load CSRF token
function loadCsrfFromMeta() {
    const tag = document.querySelector('meta[name="csrf-token"]');
    if (!tag) return;
    const token = tag.content;
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}
loadCsrfFromMeta();

// Refresh CSRF
async function refreshCsrfToken() {
    try {
        const res = await fetch("/csrf-check", {
            credentials: "include",
            headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        const data = await res.json();
        if (!data?.csrfToken) return;

        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = data.csrfToken;

        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) meta.setAttribute("content", data.csrfToken);

        console.log("🔄 CSRF token refreshed");
    } catch (e) {
        console.warn("⚠️ CSRF refresh failed");
    }
}

// Refresh every 10 mins
setInterval(refreshCsrfToken, 600000);

// Refresh on Inertia navigation
document.addEventListener("inertia:navigate", refreshCsrfToken);

// Auto-retry 419 errors
window.axios.interceptors.response.use(
    (resp) => resp,
    async (error) => {
        if (error.response?.status === 419) {
            await refreshCsrfToken();
            return window.axios(error.config);
        }
        return Promise.reject(error);
    },
);

console.log("✅ Axios + CSRF loaded");
