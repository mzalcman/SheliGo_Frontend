import type { Publication } from "../types/publication";

export const mock_publication: Publication = {
  id: 1,

  nombre: "Bolso de Cuero",
  descripcion:
    "Bolso tipo maletín de cuero genuino, color tabaco, con herrajes de bronce. El interior tiene un forro de tela a rayas. Se encuentra en excelentes condiciones, parece haber sido olvidado recientemente.",

  tipo: "perdido",
  imagen_url:
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",

  fecha_evento: "2025-10-24",
  created_at: "2025-10-24T14:30:00",
  ubicacion: "Cafetería central",
  direccion: "Zona T, calle 85",
  institucion: "Club Macabi",
  institucion_direccion:
    "Sargento Cabral al 4200, San Miguel",

  preguntas: [
    {
      id: 1,
      user_name: "Marcos C.",
      user_image:
        "https://randomuser.me/api/portraits/men/32.jpg",
      content:
        "¿Tiene algún llavero o accesorio colgando de la correa?",
      created_at: "2025-10-24T17:30:00",
    },
  ],
};