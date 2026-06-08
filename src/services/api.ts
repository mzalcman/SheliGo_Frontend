import axios from "axios";

export const api = axios.create({
  // 💡 Le agregamos un "Plan B": si la variable .env falla, usa el puerto 5000 de tu backend
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/*api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);*/