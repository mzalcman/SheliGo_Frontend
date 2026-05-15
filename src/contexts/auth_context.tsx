import {
  createContext,
  useContext,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { User } from "../types/user";

// Tipo del contexto.
// Define qué información global va a existir.
interface AuthContextType {
  user: User | null;
}

// Creamos el contexto.
const AuthContext =
  createContext<AuthContextType | null>(null);

// Props del provider.
interface AuthProviderProps {
  children: ReactNode;
}

// Provider global.
// Envuelve toda la aplicación.
export const AuthProvider = ({
  children,
}: AuthProviderProps) => {

  // Usuario temporal mockeado.
  // IMPORTANTE:
  // Más adelante esto va a venir de Supabase Auth.
  const [user] = useState<User>({
    id: 1,

    name: "Morena",

    profile_image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  });

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook interno del contexto.
// Permite reutilizar lógica fácilmente.
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  // Validación importante.
  // Evita errores si el provider no existe.
  if (!context) {
    throw new Error(
      "useAuthContext debe usarse dentro de AuthProvider"
    );
  }

  return context;
};