import { api } from "./api";

export const get_publication_by_id = async (id: string) => {
  const response = await api.get(`/publicaciones/${id}`);
  return response.data.data.publicacion;
};

export const getCategories = async () => {
  const response = await api.get("/categorias");
  return response.data;
};

export const getInstitutions = async () => {
  const response = await api.get("/instituciones");
  return response.data;
};

export const create_publication = async (formData: FormData) => {
  const response = await api.post("/publicaciones", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data.publicacion;
};

export const delete_publication = async (id: string) => {
  const response = await api.delete(`/publicaciones/${id}`);
  return response.data;
};

export const update_publication = async (id: string, formData: FormData) => {
  // 1. Obtenemos el token de autenticación
  const token = localStorage.getItem("token") || "";

  // 2. Realizamos la petición directa a la URL limpia de publicaciones
  const response = await fetch(`http://localhost:3000/publicaciones/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
      // IMPORTANTE: Al enviar FormData NO hay que definir "Content-Type" manualmente.
      // El navegador se encarga de ponerlo junto con el boundary correcto.
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      response: {
        status: response.status,
        data: errorData
      }
    };
  }

  return response.json();
};