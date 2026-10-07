import { useCallback, useEffect, useState } from "react";
import { get_admin_error_message } from "../services/admin/admin_error";

export type AdminDetailState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

type StoredResult<T> = { id: string; key: number; state: AdminDetailState<T> };

/* Carga el detalle de un recurso por id (usuario, publicación, institución).
   Mientras la respuesta guardada no corresponda al id/recarga actual, el estado
   es "loading": así no se muestra un detalle viejo al abrir otro.
   `fetcher` debe ser estable (una función de services/admin). */
export const useAdminDetail = <T,>(fetcher: (id: string) => Promise<T>, id: string | null) => {
  const [result, set_result] = useState<StoredResult<T> | null>(null);
  const [reload_key, set_reload_key] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetcher(id)
      .then((data) => {
        if (active) set_result({ id, key: reload_key, state: { status: "ready", data } });
      })
      .catch((error) => {
        if (active) {
          set_result({ id, key: reload_key, state: { status: "error", message: get_admin_error_message(error) } });
        }
      });
    return () => {
      active = false;
    };
  }, [fetcher, id, reload_key]);

  const state: AdminDetailState<T> =
    result && result.id === id && result.key === reload_key ? result.state : { status: "loading" };

  const reload = useCallback(() => set_reload_key((key) => key + 1), []);

  // Reemplaza los datos con la respuesta de una acción (sin volver a pedirlos)
  const set_data = useCallback(
    (data: T) => {
      if (id) set_result({ id, key: reload_key, state: { status: "ready", data } });
    },
    [id, reload_key]
  );

  return { state, reload, set_data };
};
