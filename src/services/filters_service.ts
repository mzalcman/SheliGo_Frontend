import { api } from "./api";
import type { FilterOption } from "../types/filter_option";

export const getCategories = async (): Promise<FilterOption[]> => {
  const response = await api.get(
    "/categorias"
  );
  return response.data.data.categorias;
};

export const getInstitutions = async (): Promise<FilterOption[]> => {
  const response = await api.get(
    "/instituciones"
  );
  return response.data.data.instituciones;
};