// Misma regla que el backend (password-schema): 8 a 100 caracteres, con una mayúscula y un número
export const get_password_error = (password: string): string | null => {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (password.length > 100) return "La contraseña no puede superar los 100 caracteres.";
  if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "La contraseña debe incluir al menos una letra mayúscula y un número.";
  }
  return null;
};
