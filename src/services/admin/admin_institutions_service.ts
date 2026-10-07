import { api } from "../api";
import { clean_params } from "./admin_params";
import type { AdminListParams, AdminPaginated } from "../../types/admin/admin_pagination";
import type {
  AdminInstitution,
  AdminInstitutionDetail,
  AdminInstitutionForm,
} from "../../types/admin/admin_institution";

export const get_admin_institutions = async (
  params: AdminListParams,
  signal?: AbortSignal
): Promise<AdminPaginated<AdminInstitution>> => {
  const response = await api.get("/admin/instituciones", { params: clean_params(params), signal });
  return response.data.data;
};

export const get_admin_institution = async (id: string): Promise<AdminInstitutionDetail> => {
  const response = await api.get(`/admin/instituciones/${id}`);
  return response.data.data.institucion;
};

/* Las instituciones viajan como multipart porque pueden incluir foto.
   Se envían todos los campos: '' le indica al backend que el valor queda vacío. */
const build_form_data = (form: AdminInstitutionForm, photo: File | null, remove_photo = false) => {
  const data = new FormData();
  (Object.keys(form) as (keyof AdminInstitutionForm)[]).forEach((key) => {
    data.append(key, form[key].trim());
  });
  if (photo) data.append("foto", photo);
  if (remove_photo && !photo) data.append("eliminarFoto", "true");
  return data;
};

// Igual que publication_service: axios completa el boundary del multipart
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const create_admin_institution = async (
  form: AdminInstitutionForm,
  photo: File | null
): Promise<AdminInstitutionDetail> => {
  const response = await api.post("/admin/instituciones", build_form_data(form, photo), multipart);
  return response.data.data.institucion;
};

export const update_admin_institution = async (
  id: string,
  form: AdminInstitutionForm,
  photo: File | null,
  remove_photo: boolean
): Promise<AdminInstitutionDetail> => {
  const response = await api.patch(
    `/admin/instituciones/${id}`,
    build_form_data(form, photo, remove_photo),
    multipart
  );
  return response.data.data.institucion;
};

export const delete_admin_institution = async (id: string): Promise<void> => {
  await api.delete(`/admin/instituciones/${id}`);
};
