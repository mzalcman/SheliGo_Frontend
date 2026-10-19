// Mismo proyecto que usa el cliente de Supabase; el bucket es el del backend (SUPABASE_BUCKET)
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const STORAGE_BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET || "avatars").trim();
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;

export const getImageUrl = (
  image?: string
) => {

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http")
  ) {
    return image;
  }

  return STORAGE_URL + image;

};