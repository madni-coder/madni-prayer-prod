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
// For production builds without an explicit `NEXT_PUBLIC_API_BASE_URL`,
// prefer the deployed Vercel URL to avoid local `localhost` network errors.
const defaultBase =
    envBase ||
    (isTauriRuntime && tauriFallback) ||
    (process.env.NODE_ENV === "production"
        ? "https://raahehidayat.vercel.app"
        : windowOrigin) ||
    "http://localhost:3000";

function mapLocalhostForAndroidEmulator(base) {
    if (typeof navigator === "undefined" || !base) return base;
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    if (!isAndroid) return base;
    try {
        const url = new URL(base, window.location?.origin || undefined);
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
            url.hostname = "10.0.2.2"; // Android emulator host alias
            return url.toString();
        }
    } catch (e) {
        // If base isn't a full URL, fallback to simple replace
        if (base.includes("localhost")) return base.replace("localhost", "10.0.2.2");
    }
    return base;
}

const resolvedBase = mapLocalhostForAndroidEmulator(defaultBase);

const apiClient = axios.create({
    baseURL: resolvedBase,
    withCredentials: false,
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
