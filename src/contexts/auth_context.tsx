import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";
import type { User } from "../types/user";

import { get_home_user } from "../services/home_service";

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

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const response =
          await get_home_user();

        const usuario =
          response.data.usuario;

        setUser({
          id: usuario.id,
          name: usuario.nombre,
          profile_image: usuario.foto,
        });

      } catch (error) {

        console.log(
          "ERROR USER:",
          error
        );

      }

    };

    fetchUser();

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