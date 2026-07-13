import { api } from "./api";

export const getCategories = async () => {
  const response = await api.get(
    "/categorias"
  );
  return response.data.data.categorias;
};

export const getInstitutions = async () => {
  const response = await api.get(
    "/instituciones"
  );
  return response.data.data.instituciones;
};