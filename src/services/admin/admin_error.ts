import axios from "axios";

/* Mensaje legible a partir de un error de la API /admin.
   El backend responde { status: 'error', message } en todos los errores controlados. */
export const get_admin_error_message = (error: unknown, fallback = "Ocurrió un error inesperado.") => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.";
    }
    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && message.trim() !== "") return message;
  }
  return fallback;
};

export const get_admin_error_status = (error: unknown): number | null =>
  axios.isAxiosError(error) ? error.response?.status ?? null : null;

export const is_request_canceled = (error: unknown) => axios.isCancel(error);
