import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import Header from "../../components/header/header";
import { useAuth } from "../../hooks/use_auth"; // Tu hook real
import { getImageUrl } from "../../utils/get_image_url"; // Tu utilitario de imágenes
import { api } from "../../services/api"; // Tu Axios service
import "./personal_info_page.css";

const PersonalInfoPage = () => {
  const navigate = useNavigate();
  const { user: typedUser, updateProfile } = useAuth() as any; 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = typedUser as any;

  // Placeholder de respaldo para evitar llamadas rotas al localhost
  const defaultPlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150";

  // 1. Inicializamos los estados con lo que tengamos a mano en el localStorage de inmediato
  const getInitialUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const initialUser = getInitialUser();

  const [nombre, setNombre] = useState(user?.nombre || initialUser?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || initialUser?.apellido || "");
  const [avatar, setAvatar] = useState(
    user?.foto 
      ? getImageUrl(user.foto) 
      : (initialUser?.foto ? getImageUrl(initialUser.foto) : defaultPlaceholder)
  );
  
  // Guardamos el binario para cuando cambiemos la foto
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tempUrlRef = useRef<string | null>(null);

  // 🚀 2. EFECTO CLAVE: Si cambian los datos de useAuth() o del localStorage, actualizamos los inputs
  useEffect(() => {
    const currentUser = user || initialUser;
    if (currentUser) {
      if (currentUser.nombre) setNombre(currentUser.nombre);
      if (currentUser.apellido) setApellido(currentUser.apellido);
      if (currentUser.foto) setAvatar(getImageUrl(currentUser.foto));
    }
  }, [user]); // 👈 Escucha activamente la carga del usuario autenticado

  useEffect(() => {
    return () => {
      if (tempUrlRef.current) {
        URL.revokeObjectURL(tempUrlRef.current);
      }
    };
  }, []);

  const handleEditAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (tempUrlRef.current) {
        URL.revokeObjectURL(tempUrlRef.current);
      }
      const newAvatarUrl = URL.createObjectURL(file);
      tempUrlRef.current = newAvatarUrl;

      setAvatar(newAvatarUrl);
      setNewImageFile(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("apellido", apellido);
      if (newImageFile) {
        formData.append("foto", newImageFile); 
      }

      // Tu ruta real de guardado hacia el backend
      const response = await api.put("/usuarios/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.status === "success") {
        const usuarioActualizado = response.data.data.usuario;
        
        if (updateProfile) {
          updateProfile(usuarioActualizado);
        } else {
          localStorage.setItem("user", JSON.stringify(usuarioActualizado));
          window.location.reload();
        }

        navigate("/perfil");
      }
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setError("Ocurrió un error al guardar tus cambios. Probá nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="personal_info_layout_page">
      <Header />

      <main className="personal_info_container">
        <button 
          className="personal_info_back_btn" 
          onClick={() => navigate("/perfil")}
          disabled={saving}
          type="button"
        >
          <ArrowLeft size={20} color="#ff6f00" strokeWidth={2.5} />
          <span>Mi Perfil</span>
        </button>

        {error && (
          <div style={{ color: "#d32f2f", textAlign: "center", marginBottom: "16px", fontFamily: "Poppins", fontSize: "14px", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <section className="personal_info_hero">
          <div className="personal_info_avatar_wrapper" onClick={handleEditAvatarClick} style={{ cursor: "pointer" }}>
            <img 
              src={avatar} 
              alt="User Avatar" 
              className="personal_info_main_avatar" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultPlaceholder;
              }}
            />
            <button 
              className="personal_info_edit_avatar_badge" 
              title="Cambiar Foto"
              type="button"
              disabled={saving}
            >
              <Edit2 size={12} strokeWidth={3} />
            </button>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*" 
              style={{ display: "none" }} 
            />
          </div>
          <h1 className="personal_info_user_name">
            {nombre} {apellido}
          </h1>
        </section>

        <form onSubmit={handleFormSubmit} className="personal_info_form_section">
          <h2>Información Personal</h2>

          <div className="personal_info_field_group">
            <label>Nombre</label>
            <div className="personal_info_input_wrapper">
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                disabled={saving}
                required
              />
              <Edit2 size={14} className="personal_info_field_edit_icon" />
            </div>
          </div>

          <div className="personal_info_field_group">
            <label>Apellido</label>
            <div className="personal_info_input_wrapper">
              <input 
                type="text" 
                value={apellido} 
                onChange={(e) => setApellido(e.target.value)} 
                disabled={saving}
                required
              />
              <Edit2 size={14} className="personal_info_field_edit_icon" />
            </div>
          </div>

          <button 
            type="submit" 
            className="personal_info_save_btn"
            disabled={saving}
            style={{
              marginTop: "28px",
              padding: "16px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: saving ? "#b0b0b0" : "#ff6f00",
              color: "#ffffff",
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0px 4px 12px rgba(255, 111, 0, 0.25)"
            }}
          >
            {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PersonalInfoPage;