import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000",
  headers: {
    "Content-Type":
      "application/json",
  },
});

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    if (token) {

      config.headers.Authorization = `Bearer ${token}`;

    }

    console.log("HEADERS:", config.headers);

    return config;

  }
);