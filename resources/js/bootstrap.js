import axios from "axios";

window.axios = axios;
axios.defaults.withCredentials = true;

<<<<<<< HEAD
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Detect production properly
const IS_PROD =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

// Correct base URL
window.axios.defaults.baseURL = IS_PROD
    ? window.location.origin
    : "http://127.0.0.1:8000";

// Load CSRF from meta
const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
if (csrf) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
}
=======
axios.defaults.baseURL = "https://joelaarmc.com";

axios.get("/sanctum/csrf-cookie");

// -------------------------------------------------------
// BASIC AXIOS SETUP
// -------------------------------------------------------
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// -------------------------------------------------------
// DETECT IF PRODUCTION OR LOCAL
// -------------------------------------------------------
const hostname = window.location.hostname;

const IS_PRODUCTION =
    hostname === "joelaarmc.com" ||
    hostname === "www.joelaarmc.com";

// -------------------------------------------------------
// FORCE CORRECT BACKEND URL
// -------------------------------------------------------
window.axios.defaults.baseURL = IS_PRODUCTION
    ? "https://joelaarmc.com"   // LIVE SERVER URL
    : "http://127.0.0.1:8000";  // LOCAL DEV URL

console.log("AXIOS baseURL:", window.axios.defaults.baseURL);

// -------------------------------------------------------
// LOAD CSRF TOKEN FROM META TAG
// -------------------------------------------------------
function loadCsrf() {
    const tag = document.querySelector('meta[name="csrf-token"]');
    if (!tag) return;
    const token = tag.content;
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

loadCsrf();

// -------------------------------------------------------
// AUTO REFRESH CSRF TOKEN (PREVENTS 419 ERRORS)
// -------------------------------------------------------
async function refreshCsrf() {
    try {
        const res = await fetch("/csrf-check", {
            credentials: "include",
            headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        const text = await res.text();

        if (text.startsWith("<!DOCTYPE")) {
            console.warn("User logged out.");
            return;
        }

        const data = JSON.parse(text);
        if (!data.csrfToken) return;

        const token = data.csrfToken;

        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;

        const meta = document.querySelector('meta[name=\"csrf-token\"]');
        if (meta) meta.setAttribute("content", token);

        console.log("CSRF refreshed");
    } catch (e) {
        console.warn("CSRF refresh failed:", e);
    }
}

setInterval(refreshCsrf, 600000); // refresh every 10 mins

document.addEventListener("inertia:navigate", () =>
    refreshCsrf()
);

// -------------------------------------------------------
// AXIOS INTERCEPTOR: RETRY AFTER 419
// -------------------------------------------------------
window.axios.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 419) {
            await refreshCsrf();
            return window.axios(error.config);
        }
        return Promise.reject(error);
    }
);
>>>>>>> 31dd85b73dfdba697dc86d8bc09635e8523f8446
