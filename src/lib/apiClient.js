import axios from "axios";

const windowOrigin =
    typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : null;
const isTauriRuntime =
    typeof window !== "undefined" && typeof window.__TAURI_IPC__ !== "undefined";

const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const tauriFallback = process.env.NEXT_PUBLIC_TAURI_DEV_HOST?.trim();

// In a Tauri bundle the app is served from a custom scheme (tauri://), so
// hitting /api locally will 404 because Next API routes are not bundled with
// the static export. Force a remote base URL when we detect that runtime.
const defaultBase =
    envBase ||
    (isTauriRuntime && tauriFallback) ||
    windowOrigin ||
    "http://localhost:3000";

const apiClient = axios.create({
    baseURL: defaultBase,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.data?.error && !error.message) {
            error.message = error.response.data.error;
        }
        return Promise.reject(error);
    }
);

export default apiClient;
