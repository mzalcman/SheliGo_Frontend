import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Peticiones (Request)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// En src/services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;

      // 🚀 SOLO redirigimos si NO estamos en registro ni en login
      if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);