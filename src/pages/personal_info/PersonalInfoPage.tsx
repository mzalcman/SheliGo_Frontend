import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, CheckCircle2, AlertCircle, X } from "lucide-react";
import Header from "../../components/header/header";
import { useAuth } from "../../hooks/use_auth"; 
import { getImageUrl } from "../../utils/get_image_url"; 
import { api } from "../../services/api"; 
import Modal from "../../components/modal/modal";
import "./personal_info_page.css";

interface Institucion {
  id: string | number;
  nombre: string;
  direccion?: string;
  foto?: string;
}

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
  const currentUser = user || initialUser;

  // Estados básicos
  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [apellido, setApellido] = useState(currentUser?.apellido || "");
  const [nombreChanged, setNombreChanged] = useState(false);
  const [apellidoChanged, setApellidoChanged] = useState(false);

  // Estados de Instituciones con guardas defensivas de arrays
  const [institucionesUsuario, setInstitucionesUsuario] = useState<Institucion[]>(
    Array.isArray(currentUser?.instituciones) ? currentUser.instituciones : []
  );
  const [catalogoInstituciones, setCatalogoInstituciones] = useState<Institucion[]>([]);
  
  // Estado para el Input de búsqueda/autocompletado
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Foto y Carga
  const [avatar, setAvatar] = useState(
    currentUser?.foto ? getImageUrl(currentUser.foto) : defaultPlaceholder
  );
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Cargar el catálogo global de instituciones con validaciones contra no-arrays
  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const response = await api.get("/instituciones");
        
        // Extraemos los datos probando distintas estructuras de respuesta comunes
        const rawData = 
          response.data?.data?.instituciones || 
          response.data?.data || 
          response.data?.instituciones || 
          response.data;

        if (Array.isArray(rawData)) {
          setCatalogoInstituciones(rawData);
        } else {
          setCatalogoInstituciones([]);
        }
      } catch (error) {
        console.error("Error al cargar la lista de instituciones:", error);
        setCatalogoInstituciones([]);
      }
    };
    fetchInstituciones();
  }, []);

  // 2. Sincronizar datos si cambia el contexto de usuario
  useEffect(() => {
    if (currentUser) {
      if (currentUser.nombre) setNombre(currentUser.nombre);
      if (currentUser.apellido) setApellido(currentUser.apellido);
      if (currentUser.foto) setAvatar(getImageUrl(currentUser.foto));
      if (Array.isArray(currentUser.instituciones)) {
        setInstitucionesUsuario(currentUser.instituciones);
      }
    }
  }, [user]);

  // Clic fuera del Dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // --- Manejo de Selección / Deselección de Instituciones ---
  const handleSelectInstitucion = (inst: Institucion) => {
    const currentList = Array.isArray(institucionesUsuario) ? institucionesUsuario : [];
    
    // Evitar duplicados
    const existe = currentList.some((i) => String(i.id) === String(inst.id));
    if (!existe) {
      setInstitucionesUsuario([...currentList, inst]);
    }

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemoveInstitucion = (idToRemove: string | number) => {
    const currentList = Array.isArray(institucionesUsuario) ? institucionesUsuario : [];
    setInstitucionesUsuario(
      currentList.filter((i) => String(i.id) !== String(idToRemove))
    );
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Guardar Formulario ---
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

      // Enviamos el array de IDs de las instituciones elegidas
      const currentList = Array.isArray(institucionesUsuario) ? institucionesUsuario : [];
      const instIds = currentList.map((i) => i.id);
      formData.append("instituciones_ids", JSON.stringify(instIds));

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

  // Filtrar sugerencias para el desplegable (sólo las no agregadas aún y según búsqueda)
  const safeCatalogo = Array.isArray(catalogoInstituciones) ? catalogoInstituciones : [];
  const safeUsuario = Array.isArray(institucionesUsuario) ? institucionesUsuario : [];

  const institucionesSugeridas = safeCatalogo.filter((catInst) => {
    const noAgregada = !safeUsuario.some((uInst) => String(uInst.id) === String(catInst.id));
    const coincideConBusqueda = catInst.nombre
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return noAgregada && coincideConBusqueda;
  });

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
          <div
            className="personal_info_avatar_wrapper"
            onClick={handleEditAvatarClick}
            style={{ cursor: "pointer" }}
          >
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

          {/* --- SECCIÓN INSTITUCIONES --- */}
          <div className="personal_info_field_group">
            <label>Instituciones</label>

            {/* Chips de Instituciones Agregadas */}
            <div className="institutions_chips_container">
              {safeUsuario.map((inst) => (
                <div key={inst.id} className="institution_chip">
                  <span>{inst.nombre}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstitucion(inst.id)}
                    disabled={saving}
                    title="Eliminar institución"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Autocompletado / Input Búsqueda */}
            <div className="institution_input_wrapper" ref={dropdownRef}>
              <div className="personal_info_input_wrapper">
                <input
                  type="text"
                  placeholder="Buscar o agregar institución..."
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  disabled={saving}
                  className="input_user_initial"
                />
              </div>

              {/* Menú Desplegable */}
              {isDropdownOpen && (
                <ul className="institution_dropdown">
                  {institucionesSugeridas.length > 0 ? (
                    institucionesSugeridas.map((inst) => (
                      <li
                        key={inst.id}
                        onClick={() => handleSelectInstitucion(inst)}
                      >
                        {inst.nombre}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: "#888", cursor: "default" }}>
                      {searchTerm.trim()
                        ? "No se encontraron coincidencias"
                        : "No hay más instituciones disponibles"}
                    </li>
                  )}
                </ul>
              )}
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