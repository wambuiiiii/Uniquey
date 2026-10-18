import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${axiosInstance.defaults.baseURL}auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        localStorage.setItem("access_token", access);
        if (refresh) {
          localStorage.setItem("refresh_token", refresh);
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // WIPES DEAD TOKENS
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        const currentPath = window.location.pathname;

        // FIX: Only forcefully redirect if they are NOT already on a login page.
        // This completely prevents the infinite refresh loop.
        if (!currentPath.includes("login")) {
          if (currentPath.includes("admin")) {
            // Use your exact admin login path here
            window.location.href = "/admin-auth/login";
          } else {
            window.location.href = "/portal/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;