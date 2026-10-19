/* Sala de chat tal como la devuelve GET /chat/salas. */
export interface ChatRoomResponse {
  sala_id: string;
  otro_usuario_id: string;
  otro_usuario_nombre: string | null;
  otro_usuario_apellido: string | null;
  otro_usuario_foto: string | null;
  ultimo_mensaje: string | null;
  ultimo_mensaje_fecha: string | null;
  // COUNT(*) de Postgres: llega como texto
  mensajes_sin_leer: string;
}
