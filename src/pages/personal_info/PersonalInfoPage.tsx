import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "../../components/header/header";
import { useAuth } from "../../hooks/use_auth"; 
import { getImageUrl } from "../../utils/get_image_url"; 
import { api } from "../../services/api"; 
import Modal from "../../components/modal/modal";
import "./personal_info_page.css";

const PersonalInfoPage = () => {
  const navigate = useNavigate();
  const { user: typedUser, updateProfile } = useAuth() as any; 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = typedUser as any;

  const defaultPlaceholder = "/user_predeterminada.png";

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
  
  const [nombreChanged, setNombreChanged] = useState(false);
  const [apellidoChanged, setApellidoChanged] = useState(false);

  const [avatar, setAvatar] = useState(
    user?.foto 
      ? getImageUrl(user.foto) 
      : (initialUser?.foto ? getImageUrl(initialUser.foto) : defaultPlaceholder)
  );
  
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
    icon: React.ReactNode;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "success",
    icon: null,
  });

  const tempUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUser = user || initialUser;
    if (currentUser) {
      if (currentUser.nombre) setNombre(currentUser.nombre);
      if (currentUser.apellido) setApellido(currentUser.apellido);
      if (currentUser.foto) setAvatar(getImageUrl(currentUser.foto));
    }
  }, [user]);

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

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      setModalConfig({
        isOpen: true,
        title: "Campos incompletos",
        description: "Por favor, completa el nombre y el apellido.",
        variant: "error",
        icon: <AlertCircle size={36} color="#d32f2f" />,
      });
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("apellido", apellido);
      if (newImageFile) {
        formData.append("foto", newImageFile); 
      }

      const response = await api.put("/usuarios/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.status === "success") {
        const usuarioActualizado = response.data.data.usuario;
        
        if (updateProfile) {
          updateProfile(usuarioActualizado);
        } else {
          localStorage.setItem("user", JSON.stringify(usuarioActualizado));
        }

        setModalConfig({
          isOpen: true,
          title: "¡Perfil actualizado!",
          description: "Tus cambios se guardaron con éxito.",
          variant: "success",
          icon: <CheckCircle2 size={36} color="#2e7d32" />,
          onConfirm: () => {
            closeModal();
            navigate("/perfil");
          },
        });
      }
    } catch (err: any) {
      console.error("Error al guardar:", err);
      
      const mensajeError =
        err.response?.data?.message ||
        "Ocurrió un error al guardar tus cambios. Por favor, probá nuevamente.";

      setModalConfig({
        isOpen: true,
        title: "Ocurrió un error",
        description: mensajeError,
        variant: "error",
        icon: <AlertCircle size={36} color="#d32f2f" />,
        onConfirm: closeModal,
      });
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
                className={nombreChanged ? "input_user_edited" : "input_user_initial"}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setNombreChanged(true);
                }} 
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
                className={apellidoChanged ? "input_user_edited" : "input_user_initial"}
                onChange={(e) => {
                  setApellido(e.target.value);
                  setApellidoChanged(true); 
                }} 
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
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </main>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        icon={modalConfig.icon}
        confirmText="Aceptar"
        onConfirm={modalConfig.onConfirm || closeModal}
      />
    </div>
  );
};

export default PersonalInfoPage;