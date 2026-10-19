import axios from "axios";

/* Lectura tipada de los errores de la API.
   El backend responde { status: 'error', message, errors? } en todos los errores controlados. */

export interface ApiFieldError {
  path: Array<string | number>;
  message: string;
}

interface ApiErrorBody {
  message?: unknown;
  errors?: unknown;
}

const get_body = (error: unknown): ApiErrorBody | undefined =>
  axios.isAxiosError(error) ? (error.response?.data as ApiErrorBody | undefined) : undefined;

// Mensaje legible: el del backend, uno de conexión si no hubo respuesta, o el fallback
export const get_api_error_message = (error: unknown, fallback = "Ocurrió un error inesperado.") => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.";
    }
    const message = get_body(error)?.message;
    if (typeof message === "string" && message.trim() !== "") return message;
  }
  return fallback;
};

export const get_api_error_status = (error: unknown): number | null =>
  axios.isAxiosError(error) ? error.response?.status ?? null : null;

// Errores por campo de las validaciones (errors[] con path y message)
export const get_api_field_errors = (error: unknown): ApiFieldError[] => {
  const errors = get_body(error)?.errors;
  if (!Array.isArray(errors)) return [];
  return errors.filter(
    (item): item is ApiFieldError =>
      typeof item === "object" && item !== null &&
      typeof (item as ApiFieldError).message === "string" &&
      Array.isArray((item as ApiFieldError).path)
  );
};
