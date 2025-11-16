import axios from "axios";
window.axios = axios;

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
