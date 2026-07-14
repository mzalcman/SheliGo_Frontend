import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "¡Atención! No se encontraron las variables de entorno de Supabase. " +
    "Asegúrate de tener configurado tu archivo .env.local en la raíz del proyecto."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);