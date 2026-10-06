import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
} from "lucide-react";
import Header from "../../components/header/header";
import { useAuth } from "../../hooks/use_auth";
import { getImageUrl } from "../../utils/get_image_url";
import { api } from "../../services/api";
import Modal from "../../components/modal/modal";
import "./personal_info_page.css";
import "../../styles/institution_picker.css";

interface Institucion {
  id: string | number;
  nombre: string;
  direccion?: string;
  foto?: string;
}

const PersonalInfoPage = () => {
  const navigate = useNavigate();
  const { user: typedUser, login: updateAuthUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tempUrlRef = useRef<string | null>(null);

  const user = typedUser as any;
  const defaultPlaceholder = "/user_predeterminada.png";

  // Obtiene el usuario guardado localmente si todavía no está disponible
  // en el contexto de autenticación.
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

  // Datos personales
  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [apellido, setApellido] = useState(currentUser?.apellido || "");
  const [nombreChanged, setNombreChanged] = useState(false);
  const [apellidoChanged, setApellidoChanged] = useState(false);

  // Instituciones del usuario
  const [institucionesUsuario, setInstitucionesUsuario] = useState<
    Institucion[]
  >(
    Array.isArray(currentUser?.instituciones)
      ? currentUser.instituciones
      : []
  );

  // Catálogo completo de instituciones
  const [catalogoInstituciones, setCatalogoInstituciones] = useState<
    Institucion[]
  >([]);

  // Buscador
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Foto
  const [avatar, setAvatar] = useState(
    currentUser?.foto
      ? getImageUrl(currentUser.foto)
      : defaultPlaceholder
  );

  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // Estado de guardado
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

  // =========================================================
  // CARGAR CATÁLOGO DE INSTITUCIONES
  // =========================================================

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const response = await api.get("/instituciones");

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
        console.error(
          "Error al cargar la lista de instituciones:",
          error
        );

        setCatalogoInstituciones([]);
      }
    };

    fetchInstituciones();
  }, []);

  // =========================================================
  // SINCRONIZAR CON EL USUARIO DEL CONTEXTO
  // =========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.nombre !== undefined) {
      setNombre(user.nombre || "");
    }

    if (user.apellido !== undefined) {
      setApellido(user.apellido || "");
    }

    if (user.foto) {
      setAvatar(getImageUrl(user.foto));
    }

    if (Array.isArray(user.instituciones)) {
      setInstitucionesUsuario(user.instituciones);
    }
  }, [user]);

  // =========================================================
  // CERRAR DROPDOWN AL HACER CLICK AFUERA
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // LIMPIAR URL TEMPORAL DE IMAGEN
  // =========================================================

  useEffect(() => {
    return () => {
      if (tempUrlRef.current) {
        URL.revokeObjectURL(tempUrlRef.current);
      }
    };
  }, []);

  // =========================================================
  // FOTO
  // =========================================================

  const handleEditAvatarClick = () => {
    if (!saving) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (tempUrlRef.current) {
      URL.revokeObjectURL(tempUrlRef.current);
    }

    const newAvatarUrl = URL.createObjectURL(file);

    tempUrlRef.current = newAvatarUrl;

    setAvatar(newAvatarUrl);
    setNewImageFile(file);
  };

  // =========================================================
  // SELECCIONAR INSTITUCIÓN
  // =========================================================

  const handleSelectInstitucion = (inst: Institucion) => {
    const currentList = Array.isArray(institucionesUsuario)
      ? institucionesUsuario
      : [];

    // Evita agregar dos veces la misma institución.
    const existe = currentList.some(
      (item) => String(item.id) === String(inst.id)
    );

    if (!existe) {
      setInstitucionesUsuario([...currentList, inst]);
    }

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // =========================================================
  // ELIMINAR INSTITUCIÓN
  // =========================================================

  const handleRemoveInstitucion = (
    idToRemove: string | number
  ) => {
    const currentList = Array.isArray(institucionesUsuario)
      ? institucionesUsuario
      : [];

    setInstitucionesUsuario(
      currentList.filter(
        (inst) => String(inst.id) !== String(idToRemove)
      )
    );
  };

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  const closeModal = () => {
    setModalConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // =========================================================
  // GUARDAR CAMBIOS
  // =========================================================

  const handleFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    if (!nombre.trim() || !apellido.trim()) {
      setModalConfig({
        isOpen: true,
        title: "Campos incompletos",
        description:
          "Por favor, completa el nombre y el apellido.",
        variant: "error",
        icon: <AlertCircle size={28} strokeWidth={2.2} />,
        onConfirm: closeModal,
      });

      return;
    }

    try {
      setSaving(true);

      const currentList = Array.isArray(institucionesUsuario)
        ? institucionesUsuario
        : [];

      // Obtenemos solamente los IDs de las instituciones.
      const instituciones_ids = currentList.map(
        (institucion) => institucion.id
      );

      // Se utiliza FormData porque también se permite actualizar
      // la foto de perfil desde esta misma pantalla.
      const formData = new FormData();

      formData.append("nombre", nombre.trim());
      formData.append("apellido", apellido.trim());

      // El backend recibe los IDs como JSON dentro del FormData.
      formData.append(
        "instituciones_ids",
        JSON.stringify(instituciones_ids)
      );

      if (newImageFile) {
        formData.append("foto", newImageFile);
      }

      const response = await api.put(
        "/usuarios/me",
        formData
      );

      // Intentamos obtener el usuario actualizado desde
      // las estructuras posibles de respuesta del backend.
      const usuarioActualizado =
        response.data?.data?.usuario ||
        response.data?.usuario ||
        response.data?.data;

      const status = response.data?.status;

      if (
        status !== "success" &&
        !usuarioActualizado
      ) {
        throw new Error(
          response.data?.message ||
            "El servidor no devolvió el usuario actualizado."
        );
      }

      // Si el backend devolvió el usuario actualizado,
      // usamos esos datos.
      const usuarioFinal = usuarioActualizado || {
        ...currentUser,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        instituciones: currentList,
      };

      // Actualizamos el contexto de autenticación (también persiste en localStorage).
      updateAuthUser(usuarioFinal);

      // Actualizamos también los estados locales.
      setNombre(usuarioFinal.nombre || nombre);
      setApellido(usuarioFinal.apellido || apellido);

      if (Array.isArray(usuarioFinal.instituciones)) {
        setInstitucionesUsuario(
          usuarioFinal.instituciones
        );
      }

      if (usuarioFinal.foto) {
        setAvatar(getImageUrl(usuarioFinal.foto));
      }

      setNombreChanged(false);
      setApellidoChanged(false);
      setNewImageFile(null);

      setModalConfig({
        isOpen: true,
        title: "¡Perfil actualizado!",
        description:
          "Tus instituciones y datos se guardaron con éxito.",
        variant: "success",
        icon: <CheckCircle2 size={28} strokeWidth={2.2} />,
        onConfirm: () => {
          closeModal();
          navigate("/perfil");
        },
      });
    } catch (err: any) {
      console.error(
        "Error al guardar los cambios:",
        err
      );

      const mensajeError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Ocurrió un error al guardar tus cambios. Por favor, probá nuevamente.";

      setModalConfig({
        isOpen: true,
        title: "Ocurrió un error",
        description: mensajeError,
        variant: "error",
        icon: <AlertCircle size={28} strokeWidth={2.2} />,
        onConfirm: closeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LISTAS SEGURAS
  // =========================================================

  const safeCatalogo = Array.isArray(
    catalogoInstituciones
  )
    ? catalogoInstituciones
    : [];

  const safeUsuario = Array.isArray(
    institucionesUsuario
  )
    ? institucionesUsuario
    : [];

  // =========================================================
  // FILTRAR INSTITUCIONES
  // =========================================================

  const institucionesSugeridas = safeCatalogo.filter(
    (catInst) => {
      const noAgregada = !safeUsuario.some(
        (uInst) =>
          String(uInst.id) === String(catInst.id)
      );

      const nombreInstitucion =
        catInst.nombre?.toLowerCase() || "";

      const busqueda =
        searchTerm.toLowerCase().trim();

      const coincideConBusqueda =
        nombreInstitucion.includes(busqueda);

      return (
        noAgregada &&
        coincideConBusqueda
      );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="personal_info_layout_page">
      <Header />

      <main className="page_container narrow personal_info_container">
        <div className="page_topbar">
          <button
            className="icon_button"
            onClick={() => navigate("/perfil")}
            disabled={saving}
            type="button"
            aria-label="Volver a Mi Perfil"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <span className="personal_info_back_label">Mi Perfil</span>
        </div>

        <section className="personal_info_hero">
          <div
            className={`personal_info_avatar_wrapper ${saving ? "is_disabled" : ""}`}
            onClick={handleEditAvatarClick}
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
              <Camera size={14} strokeWidth={2.4} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              hidden
            />
          </div>

          <h1 className="personal_info_user_name">
            {nombre} {apellido}
          </h1>
          <p className="personal_info_hint">Tocá la foto para cambiarla</p>
        </section>

        <form
          onSubmit={handleFormSubmit}
          className="personal_info_form_section"
        >
          <h2 className="section_title">Información Personal</h2>

          {/* Nombre */}
          <div className="form_field">
            <label className="form_label">Nombre</label>

            <div className="personal_info_input_wrapper">
              <input
                type="text"
                value={nombre}
                className={`form_input ${nombreChanged ? "input_user_edited" : "input_user_initial"}`}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setNombreChanged(true);
                }}
                disabled={saving}
                required
              />

              <Edit2 size={16} className="personal_info_field_edit_icon" />
            </div>
          </div>

          {/* Apellido */}
          <div className="form_field">
            <label className="form_label">Apellido</label>

            <div className="personal_info_input_wrapper">
              <input
                type="text"
                value={apellido}
                className={`form_input ${apellidoChanged ? "input_user_edited" : "input_user_initial"}`}
                onChange={(e) => {
                  setApellido(e.target.value);
                  setApellidoChanged(true);
                }}
                disabled={saving}
                required
              />

              <Edit2 size={16} className="personal_info_field_edit_icon" />
            </div>
          </div>

          {/* Instituciones */}
          <div className="form_field personal_info_institutions_group">
            <div className="personal_info_institutions_header">
              <label className="form_label">Instituciones</label>
              <span className="personal_info_institutions_count">
                {safeUsuario.length}
              </span>
            </div>

            {/* Chips de instituciones actuales */}
            {safeUsuario.length > 0 ? (
              <div className="institutions_chips_container">
                {safeUsuario.map((inst) => (
                  <div key={inst.id} className="institution_chip">
                    <span>{inst.nombre}</span>

                    <button
                      type="button"
                      onClick={() => handleRemoveInstitucion(inst.id)}
                      disabled={saving}
                      title="Eliminar institución"
                      aria-label={`Eliminar ${inst.nombre}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="form_hint">Todavía no agregaste ninguna institución.</p>
            )}

            {/* Buscador */}
            <div
              className="institution_input_wrapper personal_info_institution_search"
              ref={dropdownRef}
            >
              <Building2 size={18} />
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
                className="form_input"
              />

              {/* Dropdown */}
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
                    <li className="institution_no_results">
                      {searchTerm.trim()
                        ? "No se encontraron coincidencias"
                        : "No hay más instituciones disponibles"}
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            className="btn btn_primary btn_lg btn_block personal_info_save_btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <span>Guardando...</span>
                <div className="spinner_small"></div>
              </>
            ) : "Guardar cambios"}
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