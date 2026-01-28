import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
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
