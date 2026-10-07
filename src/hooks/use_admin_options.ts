import { useEffect, useState } from "react";
import { useAdminSession } from "./use_admin_session";
import { get_category_options, get_institution_options } from "../services/admin/admin_options_service";
import type { AdminOption } from "../services/admin/admin_options_service";

/* Instituciones para filtros y formularios.
   El admin general ve todas; el institucional, solo las que administra. */
export const useAdminInstitutionOptions = () => {
  const { session } = useAdminSession();
  const [options, set_options] = useState<AdminOption[]>(session.es_global ? [] : session.instituciones);

  useEffect(() => {
    if (!session.es_global) return;
    let active = true;
    get_institution_options()
      .then((data) => active && set_options(data))
      .catch((error) => console.error("No se pudieron cargar las instituciones", error));
    return () => {
      active = false;
    };
  }, [session.es_global]);

  return options;
};

export const useAdminCategoryOptions = () => {
  const [options, set_options] = useState<AdminOption[]>([]);

  useEffect(() => {
    let active = true;
    get_category_options()
      .then((data) => active && set_options(data))
      .catch((error) => console.error("No se pudieron cargar las categorías", error));
    return () => {
      active = false;
    };
  }, []);

  return options;
};
