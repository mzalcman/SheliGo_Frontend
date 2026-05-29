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
  estado: string;
  usuario_id: string;
  institucion_id: string;
  categoria_id: string;
  lugar_institucion: string;
  usuario_nombre: string;
  usuario_apellido: string;
  categoria_nombre: string;
  institucion_nombre: string;
}