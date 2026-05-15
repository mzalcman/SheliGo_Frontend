import type { Question } from "./question";

export interface Publication {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: "perdido" | "encontrado";
  imagen_url: string;
  fecha_evento: string;
  created_at: string;
  ubicacion: string;
  direccion: string;
  institucion: string;
  institucion_direccion: string;
  preguntas: Question[];
}