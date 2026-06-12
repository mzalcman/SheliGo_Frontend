import { api } from "./api";
console.log(
  "BASE URL:",
  api.defaults.baseURL
);
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

    return response.data;
  };