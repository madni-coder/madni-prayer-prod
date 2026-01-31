import axios from "axios";

// Prefer explicit env var, otherwise use the page origin when running in the browser
const defaultBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:3000");

const apiClient = axios.create({
    baseURL: defaultBase,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
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
