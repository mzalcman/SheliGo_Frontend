import { api } from "./api";

export const login =
  async (
    email: string,
    password: string
  ) => {

    const response =
      await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    return response.data.data;

  };

export const register =
  async (
    formData: FormData
  ) => {

    const response =
      await api.post(
        "/auth/register",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data.data;

  };
export const logout = async () => {
  const response = await api.post(
    "/auth/logout"
  );

  return response.data;
};

// Último paso del registro con Google. Se autentica con el token de Supabase
// (todavía no hay sesión de SheliGo) y devuelve { token, usuario }.
export const completarInstituciones = async (
  institucionesIds: string[],
  tokenGoogle: string
) => {
  const response = await api.post(
    "/auth/completar-instituciones",
    { instituciones_ids: institucionesIds },
    { headers: { Authorization: `Bearer ${tokenGoogle}` } }
  );
  return response.data.data;
};