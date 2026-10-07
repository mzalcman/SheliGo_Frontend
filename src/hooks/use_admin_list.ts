import { useCallback, useEffect, useState } from "react";
import type { AdminListParams, AdminPaginated } from "../types/admin/admin_pagination";
import { get_admin_error_message, is_request_canceled } from "../services/admin/admin_error";

type Fetcher<T, F> = (params: AdminListParams & F, signal: AbortSignal) => Promise<AdminPaginated<T>>;

interface ListState<T> {
  data: AdminPaginated<T> | null;
  loading: boolean;
  error: string | null;
}

/* Estado de una lista paginada del backoffice: página, búsqueda, filtros,
   carga y error. La paginación y la búsqueda las resuelve el backend.
   `fetcher` debe ser estable (una función de services/admin). */
export const useAdminList = <T, F extends object>(fetcher: Fetcher<T, F>, initial_filters: F, limit = 20) => {
  const [page, set_page] = useState(1);
  const [search, set_search_value] = useState("");
  const [filters, set_filters] = useState<F>(initial_filters);
  const [reload_key, set_reload_key] = useState(0);
  const [state, set_state] = useState<ListState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetcher({ page, limit, search, ...filters }, controller.signal)
      .then((result) => {
        // Si se borró el último elemento de la última página, retrocedemos una
        if (result.items.length === 0 && result.page > 1 && result.total > 0) {
          set_page(result.total_pages);
          return;
        }
        set_state({ data: result, loading: false, error: null });
      })
      .catch((error) => {
        if (is_request_canceled(error)) return;
        set_state((current) => ({
          data: current.data,
          loading: false,
          error: get_admin_error_message(error, "No pudimos cargar la información."),
        }));
      });

    return () => controller.abort();
  }, [fetcher, page, limit, search, filters, reload_key]);

  // Cada cambio vuelve a mostrar el estado de carga sin borrar la tabla actual
  const start_loading = () => set_state((current) => ({ ...current, loading: true, error: null }));

  const set_search = useCallback((value: string) => {
    start_loading();
    set_search_value(value);
    set_page(1);
  }, []);

  const set_filter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    start_loading();
    set_filters((current) => ({ ...current, [key]: value }));
    set_page(1);
  }, []);

  const go_to_page = useCallback((next: number) => {
    start_loading();
    set_page(next);
  }, []);

  const reload = useCallback(() => {
    start_loading();
    set_reload_key((key) => key + 1);
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    page,
    search,
    filters,
    set_search,
    set_filter,
    go_to_page,
    reload,
  };
};
