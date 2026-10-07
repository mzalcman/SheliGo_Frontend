export type AdminPublicationState = "activa" | "recuperada" | "eliminada";
export type AdminPublicationType = "perdido" | "encontrado";

export interface AdminPublication {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: AdminPublicationType;
  estado: AdminPublicationState;
  fecha_evento: string;
  created_at: string;
  updated_at: string | null;
  lugar_institucion: string | null;
  institucion_id: string | null;
  institucion_nombre: string | null;
  categoria_id: string | null;
  categoria_nombre: string | null;
  usuario_id: string;
  usuario_nombre: string;
  usuario_apellido: string | null;
  usuario_email: string;
  foto_principal_url: string | null;
}

export interface AdminPublicationDetail extends Omit<AdminPublication, "foto_principal_url"> {
  preguntas_count: number;
  archivos: { id: string; url: string; mime_type: string | null; es_principal: boolean }[];
}

export interface AdminPublicationFilters {
  estado?: AdminPublicationState;
  tipo?: AdminPublicationType;
  institucion_id?: string;
  categoria_id?: string;
  usuario_id?: string;
}
