import { api } from "./api";

/*
Traer preguntas
de publicación.
*/

export const get_questions =
  async (
    publication_id: string
  ) => {

    const response =
      await api.get(

        `/publicaciones/${publication_id}/preguntas`

      );

    return response.data;
  };

/*
Crear pregunta.
*/

export const create_question =
  async (

    publication_id: string,

    usuario_id: string,

    contenido: string

  ) => {

    const response =
      await api.post(

        `/publicaciones/${publication_id}/preguntas`,

        {
          usuario_id,
          contenido,
        }

      );

    return response.data;
  };