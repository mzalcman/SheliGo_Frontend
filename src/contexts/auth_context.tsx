import {createContext,useContext,useState, useEffect,} from "react";
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const googleUser = {
          id: session.user.id,
          nombre: session.user.user_metadata.full_name || session.user.user_metadata.name,
          foto: session.user.user_metadata.avatar_url,
        };

        localStorage.setItem("user", JSON.stringify(googleUser));
        
        setUser({
          id: googleUser.id,
          name: googleUser.nombre,
          profile_image: googleUser.foto,
        });
        setLoading(false); 
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const usuario = JSON.parse(storedUser);
          setUser({
            id: usuario.id,
            name: usuario.nombre,
            profile_image: usuario.foto,
          });
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

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, 
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading, 
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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext debe usarse dentro de AuthProvider"
    );
  }

  return context;
};