import type { AdminPublicationState, AdminPublicationType } from "./admin_publication";

export interface AdminActivity {
  id: string;
  accion: string;
  entidad: "usuario" | "publicacion" | "institucion" | "categoria";
  entidad_id: string | null;
  institucion_id: string | null;
  detalle: Record<string, unknown> | null;
  created_at: string;
  admin_nombre: string;
  admin_apellido: string | null;
  institucion_nombre: string | null;
}

export interface AdminDashboard {
  totales: {
    usuarios_total: number;
    usuarios_nuevos_30d: number;
    instituciones_total: number;
    categorias_total: number;
    publicaciones_activas: number;
    publicaciones_recuperadas: number;
    publicaciones_eliminadas: number;
    publicaciones_perdidos: number;
    publicaciones_encontrados: number;
    publicaciones_nuevas_30d: number;
  };
  serie_publicaciones: { fecha: string; perdidos: number; encontrados: number }[];
  publicaciones_recientes: {
    id: string;
    nombre: string;
    tipo: AdminPublicationType;
    estado: AdminPublicationState;
    created_at: string;
    institucion_nombre: string | null;
    categoria_nombre: string | null;
  }[];
  instituciones_destacadas: {
    id: string;
    nombre: string;
    publicaciones_activas: number;
    publicaciones_recuperadas: number;
  }[];
  actividad_reciente: AdminActivity[];
}
