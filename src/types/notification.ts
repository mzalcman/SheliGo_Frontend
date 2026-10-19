/* Notificaciones tal como las devuelve GET /notificaciones (tabla notificaciones). */
export type NotificationType =
  | "nueva_pregunta"
  | "nueva_respuesta"
  | "nueva_coincidencia"
  | "nuevo_mensaje"
  | "nuevo_chat"
  | "seguridad"
  | string;

export interface NotificationItem {
  id: string;
  usuario_id: string;
  publicacion_id?: string;
  titulo: string;
  contenido: string;
  tipo: NotificationType;
  leida: boolean;
  created_at: string;
  updated_at?: string;
}
