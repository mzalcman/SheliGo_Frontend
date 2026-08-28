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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el servidor responde 401 (Sesión Expirada / Token Inválido)
    if (error.response && error.response.status === 401) {
      // 1. Limpiamos datos caducados del almacenamiento
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 2. Redirigimos al Login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);