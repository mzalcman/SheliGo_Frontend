import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { supabase } from "../services/supabase";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean; 
  login: (usuario: any) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>; // 🚀 Agregamos refetch por si actualizan perfil
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 

  // Mapeo seguro del objeto usuario
  const mapUserResponse = (usuarioRaw: any): User => {
    return {
      id: usuarioRaw.id,
      nombre: usuarioRaw.nombre || usuarioRaw.name || "",
      apellido: usuarioRaw.apellido || "",
      email: usuarioRaw.email || "",
      telefono: usuarioRaw.telefono || "",
      foto: usuarioRaw.foto || usuarioRaw.profile_image || "",
      instituciones: usuarioRaw.instituciones || [],
      name: usuarioRaw.nombre || usuarioRaw.name || "",
      profile_image: usuarioRaw.foto || usuarioRaw.profile_image || ""
    };
  };

  // 🔄 Guarda localmente e incrementa el estado global
  const saveAndSetUser = (uData: any) => {
    localStorage.setItem("user", JSON.stringify(uData));
    setUser(mapUserResponse(uData));
  };

  useEffect(() => {
  // 1. Cargar inmediatamente el usuario que ya teníamos guardado al arrancar la app
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const usuario = JSON.parse(storedUser);
      setUser(mapUserResponse(usuario));
    } catch (e) {
      console.error("Error al parsear el usuario del localStorage", e);
    }
  }
  setLoading(false);

  // 2. Escuchar cambios SOLO para el flujo con Google / Supabase
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const miTokenPropio = localStorage.getItem("token");

      if (!miTokenPropio) {
        setLoading(true); 
        try {
          const response = await api.post(
            "/auth/google",
            {},
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          const resBody = response.data;

          if (resBody?.data?.token) {
            const uData = resBody.data.usuario;
            localStorage.setItem("token", resBody.data.token);
            saveAndSetUser(uData); // Guarda las instituciones de Google
            setLoading(false);

            const redirectUrl = localStorage.getItem("redirect_after_login");
            if (redirectUrl) {
              localStorage.removeItem("redirect_after_login");
              window.location.href = redirectUrl;
            } else {
              window.location.href = "/home";
            }
          }
        } catch (error) {
          console.error("Error al sincronizar Google con tu backend:", error);
          setLoading(false);
        }
      }
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const login = (uData: any) => {
    saveAndSetUser(uData);
  };

  const loginWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`, 
          queryParams: {
            prompt: 'select_account consent', 
            access_type: 'offline',
          },
        },
      });
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const refetchUser = async () => {
    // Opcional: si tienes un endpoint como /auth/me o /usuarios/perfil
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return context;
};