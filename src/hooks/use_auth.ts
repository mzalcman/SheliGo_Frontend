// Custom hook.
// Simplifica imports y mantiene arquitectura limpia.

import { useAuthContext } from "../contexts/auth_context";

export const useAuth = () => {
  return useAuthContext();
};