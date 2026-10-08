/* Valores reales de publicaciones.estado en la base (CHECK publicaciones_estado_check).
   "eliminada" es la baja lógica: la API deja de devolverla en la app. */
export type PublicationState = "activa" | "recuperada" | "eliminada";

export interface Publication {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_evento: string;
  latitud: number;
  longitud: number;
  created_at: string;
  updated_at: string;
  tipo: string;
  estado: PublicationState;
  usuario_id: string;
  institucion_id: string;
  categoria_id: string;
  lugar_institucion: string;

  usuario_nombre: string;
  usuario_apellido: string;
  usuario_foto: string;

  categoria_nombre: string;
  institucion_nombre: string;
  institucion_direccion:string;
}