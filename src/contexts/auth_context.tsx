import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { supabase } from "../services/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean; 
  login: (usuario: any) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      
      if (session?.user) {
        const miTokenPropio = localStorage.getItem("token");

        if (!miTokenPropio) {
          setLoading(true); 
          try {
            const response = await fetch("http://localhost:3000/auth/google", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              }
            });

            const resBody = await response.json();

            if (resBody?.data?.token) {
              localStorage.setItem("token", resBody.data.token);
              localStorage.setItem("user", JSON.stringify(resBody.data.usuario));
              
              setUser({
                id: resBody.data.usuario.id,
                name: resBody.data.usuario.nombre,
                profile_image: resBody.data.usuario.foto,
              });
              
              setLoading(false);

              // 🔴 CORRECCIÓN AQUÍ: Revisar si el usuario venía por un enlace compartido antes de forzar /home
              const redirectUrl = localStorage.getItem("redirect_after_login");
              if (redirectUrl) {
                localStorage.removeItem("redirect_after_login"); // Limpiar
                window.location.href = redirectUrl; // Llevar a la publicación
              } else {
                window.location.href = "/home"; // Comportamiento por defecto
              }
              return;
            }
          } catch (error) {
            console.error("Error al sincronizar Google con tu backend:", error);
          }
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const usuario = JSON.parse(storedUser);
            setUser({ id: usuario.id, name: usuario.nombre, profile_image: usuario.foto });
          }
          setLoading(false);
          return;
        }
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser && !user) {
        try {
          const usuario = JSON.parse(storedUser);
          setUser({ id: usuario.id, name: usuario.nombre, profile_image: usuario.foto });
        } catch (e) {
          console.error("Error al parsear el usuario del localStorage", e);
        }
      }
      setLoading(false); 
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (usuario: any) => {
    localStorage.setItem("user", JSON.stringify(usuario));
    setUser({ id: usuario.id, name: usuario.nombre, profile_image: usuario.foto });
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

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return context;
};