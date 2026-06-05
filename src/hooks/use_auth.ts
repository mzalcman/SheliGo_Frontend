import { useAuthContext } from "../contexts/auth_context";

export const useAuth = () => {
  return useAuthContext();
};