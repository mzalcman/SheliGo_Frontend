import { api } from "./api";

export const login =
  async (
    email: string,
    password: string
  ) => {

    const response =
      await api.post(
        "/login/login",
        {
          email,
          password,
        }
      );

    return response.data;

  };

export const register =
  async (
    formData: FormData
  ) => {

    const response =
      await api.post(
        "/register/register",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;

  };