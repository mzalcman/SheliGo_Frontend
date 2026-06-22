import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
interface AuthContextType {
  user: User | null;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {

  const [user, setUser] = useState<User | null>(null);


useEffect(() => {

  const storedUser = localStorage.getItem("user");


  if (!storedUser) {
    return;
  }

  const usuario = JSON.parse(storedUser);


  setUser({
    id: usuario.id,
    name: usuario.nombre,
    profile_image: usuario.foto,
  });

}, []);

  return (
    <AuthContext.Provider
      value={{ user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuthContext debe usarse dentro de AuthProvider"
    );

  }

  return context;
};