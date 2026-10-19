// Mismas reglas que el backend (upload-middleware): JPG, PNG o WEBP de hasta 8 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_TYPES.join(",");
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const get_image_error = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Solo se aceptan imágenes JPG, PNG o WEBP.";
  if (file.size > MAX_IMAGE_BYTES) return "La imagen supera los 8 MB.";
  return null;
};
