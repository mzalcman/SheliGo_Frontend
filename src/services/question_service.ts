import { api } from "./api";

export const get_questions = async (publication_id: string) => {
  const response = await api.get(`/publicaciones/${publication_id}/preguntas`);
  return response.data.data.preguntas;
};

export const create_question = async (
  publication_id: string,
  usuario_id: string,
  contenido: string
) => {
  const response = await api.post(`/publicaciones/${publication_id}/preguntas`, {
    usuario_id,
    contenido,
  });
  return response.data.data.preguntas;
};

export const create_answer = async (
  question_id: string,
  data: { contenido: string }
) => {
  const response = await api.post(`/publicaciones/preguntas/${question_id}/respuesta`, data);
  return response.data;
};