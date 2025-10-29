/**
 * --------------------------------------------------------------------------
 * Axios HTTP & CSRF Setup
 * --------------------------------------------------------------------------
 * This file ensures that all Axios / Inertia POST, PUT, PATCH and DELETE
 * requests include the correct CSRF token to prevent 419 (Page Expired) errors.
 */

import axios from "axios";

window.axios = axios;

// ✅ Always mark requests as XHR (Laravel checks this)
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// ✅ Include CSRF token from <meta> tag for all requests
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    console.log("✅ CSRF token loaded successfully into Axios headers");
} else {
    console.warn(
        "⚠️ CSRF token not found in document meta tag. Some POST requests may fail.",
    );
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
