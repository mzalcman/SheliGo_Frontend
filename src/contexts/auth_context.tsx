import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { supabase } from "../services/supabase";


interface AuthContextType {
  user: User | null;
  login: (usuario: any) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
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
    // 1. Escuchar la sesión activa de Supabase (por si entra con Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const googleUser = {
          id: session.user.id,
          nombre: session.user.user_metadata.full_name || session.user.user_metadata.name,
          foto: session.user.user_metadata.avatar_url,
        };


        // Lo guardamos en localStorage con la misma estructura del backend
        localStorage.setItem("user", JSON.stringify(googleUser));
       
        setUser({
          id: googleUser.id,
          name: googleUser.nombre,
          profile_image: googleUser.foto,
        });
        return;
      }


      // 2. Si no hay sesión de Supabase, revisamos el login clásico por LocalStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const usuario = JSON.parse(storedUser);
        setUser({
          id: usuario.id,
          name: usuario.nombre,
          profile_image: usuario.foto,
        });
      }
    });


    return () => {
      subscription.unsubscribe();
    };
  }, []);


  // Login tradicional desde tu formulario clásico
  const login = (usuario: any) => {
    localStorage.setItem(
      "user",
      JSON.stringify(usuario)
    );


    setUser({
      id: usuario.id,
      name: usuario.nombre,
      profile_image: usuario.foto,
    });
  };


  // Login con Google nativo desde el Front
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, // Te devuelve a la URL donde estés corriendo la app
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
    }
  };


  const logout = async () => {
    // Cerramos sesión tanto en Supabase como localmente
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
      }}
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

