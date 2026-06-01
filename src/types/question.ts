export interface Question {
  id: string;
  contenido: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    foto: string;
  };
}