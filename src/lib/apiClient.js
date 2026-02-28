import axios from "axios";

// In a Tauri bundle the app is served from a custom scheme (tauri://), so
// hitting /api locally will 404 because Next API routes are not bundled with
// Use the exact base URL defined in the environment variable.
// It is the developer's responsibility to change this during build (e.g. to the vercel URL).
const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
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
