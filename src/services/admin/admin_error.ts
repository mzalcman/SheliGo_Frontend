import axios from "axios";

/* Errores de la API /admin: misma lectura que el resto de la app. */
export {
  get_api_error_message as get_admin_error_message,
  get_api_error_status as get_admin_error_status,
} from "../api_error";

export const is_request_canceled = (error: unknown) => axios.isCancel(error);
