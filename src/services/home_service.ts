import { api } from "./api";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL;

export const get_home_user =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/home/usuario`
      );

    return response.data;
};

export const get_home_publications =
  async () => {

    const response =
      await api.get(
        "/home/publicaciones"
      );

    return response.data;
  };

export const get_home_institutions =
  async () => {

    const response =
      await api.get(
        "/home/instituciones"
      );

    return response.data;
  };