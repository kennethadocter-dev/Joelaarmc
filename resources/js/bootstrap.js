/**
 * --------------------------------------------------------------------------
 * Axios HTTP & CSRF Setup
 * --------------------------------------------------------------------------
 * This file ensures that all Axios / Inertia POST, PUT, PATCH and DELETE
 * requests include the correct CSRF token to prevent 419 (Page Expired) errors.
 */

import axios from "axios";
window.axios = axios;

window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// ✅ Automatically include CSRF token
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    console.log("✅ CSRF token loaded successfully into Axios headers");
} else {
    console.error("⚠️ No CSRF token found in <meta> tag!");
}

// Optional: enable cookies (needed for cross-domain requests, if any)
window.axios.defaults.withCredentials = true;

// Optional: small logging helper for debugging
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 419) {
            console.error("❌ CSRF Token mismatch or expired.");
        }
        return Promise.reject(error);
    },
);
