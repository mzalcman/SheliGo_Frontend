/* Quita valores vacíos para no mandar ?search=&estado= a la API */
export const clean_params = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
