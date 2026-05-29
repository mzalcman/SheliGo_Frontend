import { api } from "./api";

/*Trae toda la home.*/

export const get_home_data =
  async () => {

    const response =
      await api.get("/home");

    return response.data;
  };