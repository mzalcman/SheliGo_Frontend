import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { supabase } from "../services/supabase";
import { api, getMe } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usuario: any, token?: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>; // 🚀 Agregamos refetch por si actualizan perfil
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mapeo seguro del objeto usuario
  // En AuthContext.tsx

  // En AuthContext.tsx

  const mapUserResponse = (usuarioRaw: any): User => {
    // Buscamos las instituciones probando todos los nombres posibles que suele enviar el backend
    const insts =
      usuarioRaw.instituciones ||
      usuarioRaw.instituciones_ids ||
      usuarioRaw.user_institutions ||
      usuarioRaw.institucion ||
      [];

    return {
      id: usuarioRaw.id,
      rol: usuarioRaw.rol,
      nombre: usuarioRaw.nombre || usuarioRaw.name || "",
      apellido: usuarioRaw.apellido || "",
      email: usuarioRaw.email || "",
      telefono: usuarioRaw.telefono || "",
      foto: usuarioRaw.foto || usuarioRaw.profile_image || "",
      instituciones: Array.isArray(insts) ? insts : [insts], // Nos aseguramos de que siempre sea un Array
      name: usuarioRaw.nombre || usuarioRaw.name || "",
      profile_image: usuarioRaw.foto || usuarioRaw.profile_image || ""
    };
  };

  // Destino después de iniciar sesión: la página que se quería ver o /home
  const redirectAfterLogin = () => {
    const redirectUrl = localStorage.getItem("redirect_after_login");
    if (redirectUrl) {
      localStorage.removeItem("redirect_after_login");
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/home";
    }
  };

  const saveAndSetUser = (uData: any, token?: string) => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    localStorage.setItem("user", JSON.stringify(uData));
    setUser(mapUserResponse(uData));
  };

  useEffect(() => {
    // Cargar inmediatamente el usuario que ya teníamos guardado al arrancar la app
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

    // Escuchar cambios SOLO para el flujo con Google / Supabase
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

            const resData = response.data?.data;

            // Sin instituciones todavía: el backend no emite sesión de SheliGo.
            // El registro se completa en /completar-perfil con el token de Google.
            if (resData?.requiereCompletarPerfil) {
              setLoading(false);
              if (window.location.pathname !== "/completar-perfil") {
                window.location.href = "/completar-perfil";
              }
              return;
            }

            if (resData?.token) {
              saveAndSetUser(resData.usuario, resData.token);
              setLoading(false);
              redirectAfterLogin();
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

  // token es opcional: el login con email ya lo guarda por su cuenta
  const login = (uData: any, token?: string) => {
    saveAndSetUser(uData, token);
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

  // Refresca el usuario desde /usuarios/me conservando lo que ya estaba guardado
  // (las sesiones iniciadas antes del backoffice no traen el rol).
  const refetchUser = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const fresh = await getMe();
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      saveAndSetUser({ ...stored, ...fresh });
    } catch (error) {
      console.error("No se pudo actualizar el usuario", error);
    }
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