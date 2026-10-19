import axios from "axios";
import { supabase } from "./supabase";

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

// Sesión vencida: se cierra todo y se vuelve al login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const requestUrl: string = error.config?.url ?? "";

      // Login, registro y alta con Google muestran su propio error (credenciales, token de Google vencido)
      const esPantallaDeIngreso = ["/login", "/register", "/completar-perfil"].some((ruta) => currentPath.includes(ruta));
      if (!esPantallaDeIngreso && !requestUrl.startsWith("/auth/")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Sin esto, la sesión de Google guardada vuelve a iniciar sesión sola al llegar al login
        await supabase.auth.signOut().catch(() => undefined);
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export const getMe = async () => {
  const response = await api.get("/usuarios/me");
  return response.data.data.usuario;
};
