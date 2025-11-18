import axios from "axios";

// -------------------------------------------------------
// GLOBAL AXIOS INSTANCE
// -------------------------------------------------------
window.axios = axios;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// -------------------------------------------------------
// DETECT IF WE ARE IN PRODUCTION
// -------------------------------------------------------
const IS_PRODUCTION =
    window.location.hostname === "joelaarmc.com" ||
    window.location.hostname === "www.joelaarmc.com";

// -------------------------------------------------------
// AUTO-SELECT CORRECT BACKEND URL
// -------------------------------------------------------
window.axios.defaults.baseURL = IS_PRODUCTION
    ? "https://joelaarmc.com" // live domain
    : "http://127.0.0.1:8000"; // local backend

console.log("AXIOS baseURL:", window.axios.defaults.baseURL);

// -------------------------------------------------------
// LOAD CSRF TOKEN FROM META
// -------------------------------------------------------
const csrfMeta = document.querySelector('meta[name="csrf-token"]');
if (csrfMeta) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfMeta.content;
}

// -------------------------------------------------------
// ALWAYS GET SANCTUM CSRF COOKIE FROM CORRECT SERVER
// -------------------------------------------------------
axios
    .get("/sanctum/csrf-cookie")
    .then(() => {
        console.log("CSRF cookie loaded");
    })
    .catch((err) => {
        console.warn("CSRF cookie fetch failed:", err.message);
    });

// -------------------------------------------------------
// HANDLE 419 ERRORS (EXPIRED CSRF TOKEN)
// -------------------------------------------------------
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            console.warn("CSRF expired — refreshing...");

            try {
                await axios.get("/sanctum/csrf-cookie");
                return axios(error.config); // retry request
            } catch (e) {
                console.error("Failed to refresh CSRF:", e);
            }
        }

        return Promise.reject(error);
    },
);
