const STORAGE_URL =
  "https://evovbsxgvzljkbcheipp.supabase.co/storage/v1/object/public/avatars/";

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