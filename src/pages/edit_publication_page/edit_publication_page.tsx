import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Loader from "../../components/loader/loader";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { ArrowLeft, Check, X } from "lucide-react";
import Modal from "../../components/modal/modal";
import {
  getCategories,
  getInstitutions,
  get_publication_by_id,
  update_publication,
  get_publication_photos
} from "../../services/publication_service";
import "./edit_publication_page.css";

interface BackendItem {
  id: string;
  nombre: string;
}

interface PublicationImage {
  id: string;
  url: string;
}

const EditPublicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<BackendItem[]>([]);
  const [instituciones, setInstituciones] = useState<BackendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [originalBackendImages, setOriginalBackendImages] = useState<PublicationImage[]>([]);
  const [existingImages, setExistingImages] = useState<PublicationImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [lugarInstitucion, setLugarInstitucion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [institucion, setInstitucion] = useState("");

  const [filteredInstituciones, setFilteredInstituciones] = useState<BackendItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const [isModified, setIsModified] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categoriasRes, institucionesRes, pubData, fotosRes] = await Promise.all([
          getCategories(),
          getInstitutions(),
          get_publication_by_id(id!),
          get_publication_photos(id!)
        ]);

        const listaCategorias: BackendItem[] = categoriasRes?.categorias || categoriasRes?.data?.categorias || (Array.isArray(categoriasRes) ? categoriasRes : []);
        const listaInstituciones: BackendItem[] = institucionesRes?.instituciones || institucionesRes?.data?.instituciones || (Array.isArray(institucionesRes) ? institucionesRes : []);

        setCategorias(listaCategorias);
        setInstituciones(listaInstituciones);

        if (pubData) {
          setNombre(pubData.nombre || "");
          setTipo(pubData.tipo || "");
          setCategoriaId(pubData.categoria_id || "");
          setFechaEvento(pubData.fecha_evento ? pubData.fecha_evento.split("T")[0] : "");
          setLugarInstitucion(pubData.lugar_institucion || "");
          setDescripcion(pubData.descripcion || "");

          const instMatch = listaInstituciones.find((inst) => String(inst.id) === String(pubData.institucion_id));
          if (instMatch) setInstitucion(instMatch.nombre);

          const fotosRaw = fotosRes || [];
          let imagenesProcesadas: PublicationImage[] = [];

          if (Array.isArray(fotosRaw)) {
            imagenesProcesadas = fotosRaw.map((img: any) => {
              console.log("📸 Objeto foto crudo del Backend:", img);

              if (typeof img === "string") {
                return { id: img, url: img };
              }

              const urlFoto = img.url || img.ruta || img.nombre_servidor || "";
              const urlCompleta = urlFoto.startsWith("http")
                ? urlFoto
                : `http://localhost:3000/uploads/${urlFoto}`;

              // Mapea la clave primaria de la foto (priorizando IDs sobre rutas de archivo)
              const realId = String(
                img.id ?? img._id ?? img.foto_id ?? img.archivo_id ?? img.id_archivo ?? img.ruta ?? img.nombre_servidor ?? ""
              );

              return {
                id: realId,
                url: urlCompleta
              };
            }).filter((img) => img.url !== "");
          }

          console.log("📸 Fotos procesadas final:", imagenesProcesadas);
          setOriginalBackendImages(imagenesProcesadas);
          setExistingImages(imagenesProcesadas);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error cargando los datos de edición:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  useEffect(() => {
    if (institucion.trim() === "") {
      setFilteredInstituciones([]);
    } else {
      const filtradas = instituciones.filter((inst) =>
        inst.nombre.toLowerCase().includes(institucion.toLowerCase())
      );
      setFilteredInstituciones(filtradas);
    }
  }, [institucion, instituciones]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trackChange = (field: string) => {
    setIsModified(prev => ({ ...prev, [field]: true }));
  };

  const handleSaveChanges = async () => {
    if (isSubmitting) return;

    setFormErrors({});
    setBackendErrors([]);

    const errors: Record<string, boolean> = {};
    const messages: string[] = [];

    if (!nombre.trim() || nombre.trim().length < 3) {
      errors.nombre = true;
      messages.push("El nombre debe tener al menos 3 caracteres.");
    }
    if (!tipo) {
      errors.tipo = true;
      messages.push("El tipo debe ser perdido o encontrado.");
    }
    if (!categoriaId) {
      errors.categoriaId = true;
      messages.push("La categoría es inválida o no ha sido seleccionada.");
    }
    if (!fechaEvento) {
      errors.fechaEvento = true;
      messages.push("La fecha ingresada no es válida.");
    } else {
      const parsedDate = Date.parse(`${fechaEvento}T00:00:00`);
      if (isNaN(parsedDate)) {
        errors.fechaEvento = true;
        messages.push("La fecha ingresada no es válida.");
      }
    }

    const institucionEncontrada = instituciones.find(
      (item) => item.nombre.toLowerCase() === institucion.trim().toLowerCase()
    );

    if (!institucion.trim() || !institucionEncontrada) {
      errors.institucion = true;
      messages.push("La institución es inválida o no ha sido seleccionada de la lista.");
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setBackendErrors(messages);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    // 1. CAMPOS DE TEXTO PRIMERO
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("categoria_id", categoriaId);
    formData.append("fecha_evento", `${fechaEvento}T00:00:00`);
    formData.append("lugar_institucion", lugarInstitucion);
    formData.append("descripcion", descripcion);
    formData.append("institucion_id", institucionEncontrada ? String(institucionEncontrada.id) : "");

    // 2. FOTOS A ELIMINAR (Como JSON String)
    const fotosAEliminar = originalBackendImages
      .filter(origImg => !existingImages.some(currImg => currImg.id === origImg.id))
      .map(img => img.id);

    console.log("🗑️ Fotos a eliminar calculadas (IDs):", fotosAEliminar);

    if (fotosAEliminar.length > 0) {
      formData.append("fotosAEliminar", JSON.stringify(fotosAEliminar));
    }

    // 3. ARCHIVOS DE IMAGEN NUEVOS (Al final)
    if (newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append("imagenes", image);
      });
    }

    try {
      await update_publication(id!, formData);
      setShowModal(true);
    } catch (error: any) {
      console.error("Error al guardar cambios:", error);

      const nuevosErroresCampos: Record<string, boolean> = {};
      let mensajesError: string[] = [];

      if (error?.response?.status === 403) {
        mensajesError = ["No tienes permisos para editar esta publicación."];
      } else if (error?.response?.data) {
        const data = error.response.data;

        if (Array.isArray(data.errors)) {
          data.errors.forEach((err: any) => {
            if (err && typeof err === "object") {
              if (err.path && err.path.length > 0) {
                const campo = err.path[0];
                mensajesError.push(err.message);

                if (campo === "categoria_id") nuevosErroresCampos.categoriaId = true;
                else if (campo === "fecha_evento") nuevosErroresCampos.fechaEvento = true;
                else if (campo === "lugar_institucion") nuevosErroresCampos.lugarInstitucion = true;
                else if (campo === "institucion_id") nuevosErroresCampos.institucion = true;
                else nuevosErroresCampos[campo] = true;
              } else if (typeof err === "string") {
                mensajesError.push(err);
              }
            } else if (typeof err === "string") {
              mensajesError.push(err);
            }
          });
        } else if (data.message) {
          mensajesError = [data.message];
        }
      }

      if (mensajesError.length === 0) {
        mensajesError = ["Hubo un error inesperado al actualizar los datos."];
      }

      setFormErrors(nuevosErroresCampos);
      setBackendErrors(mensajesError);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit_loader_fallback">
        <Loader />
      </div>
    );
  }

  return (
    <div className="edit_page">
      <Header />

      <main className="edit_content">
        <button className="edit_back_btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#ff6f00" strokeWidth={2} />
          <span className="edit_back_text">Editar Publicación</span>
        </button>

        <h1 className="edit_title">Modificar Objeto</h1>
        <p className="edit_subtitle">
          Ayúdanos a devolverle el alma al club reportando lo que falta o lo que sobra.
        </p>

        <div className="edit_uploader_wrapper">
          <ImageUploader
            images={newImages}
            setImages={setNewImages}
            maxFiles={5 - existingImages.length}
          />

          {existingImages.length > 0 && (
            <div className="edit_backend_images_preview">
              <p className="edit_section_mini_title">Imágenes actuales de la publicación:</p>
              <div className="image_preview_container">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="image_preview_wrapper">
                    <img src={image.url} className="image_preview" alt="Existente backend" />
                    <button
                      type="button"
                      className="remove_image_button"
                      onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                      title="Eliminar imagen"
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="edit_form_card">
          <label>¿Qué encontraste o perdiste?</label>
          <input
            className={`edit_input ${isModified.nombre ? "text_black" : "text_gray"} ${formErrors.nombre ? "input_error" : ""}`}
            value={nombre}
            maxLength={45}
            onChange={(e) => {
              setNombre(e.target.value);
              trackChange("nombre");
              if (formErrors.nombre) setFormErrors(prev => ({ ...prev, nombre: false }));
            }}
          />

          <label>Estado del objeto</label>
          <select
            className={`edit_input ${isModified.tipo ? "text_black" : "text_gray"} ${formErrors.tipo ? "input_error" : ""}`}
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              trackChange("tipo");
              if (formErrors.tipo) setFormErrors(prev => ({ ...prev, tipo: false }));
            }}
          >
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>

          <label>Categoría</label>
          <select
            className={`edit_input ${isModified.categoriaId ? "text_black" : "text_gray"} ${formErrors.categoriaId ? "input_error" : ""}`}
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              trackChange("categoriaId");
              if (formErrors.categoriaId) setFormErrors(prev => ({ ...prev, categoriaId: false }));
            }}
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          <label>¿Cuándo ocurrió?</label>
          <input
            type="date"
            max={todayStr}
            className={`edit_input ${isModified.fechaEvento ? "text_black" : "text_gray"} ${formErrors.fechaEvento ? "input_error" : ""}`}
            value={fechaEvento}
            onChange={(e) => {
              setFechaEvento(e.target.value);
              trackChange("fechaEvento");
              if (formErrors.fechaEvento) setFormErrors(prev => ({ ...prev, fechaEvento: false }));
            }}
          />

          <label>Institución</label>
          <div className="edit_autocomplete_container" ref={autocompleteRef}>
            <input
              className={`edit_input ${isModified.institucion ? "text_black" : "text_gray"} ${formErrors.institucion ? "input_error" : ""}`}
              value={institucion}
              placeholder="Escribe para buscar tu club..."
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setInstitucion(e.target.value);
                trackChange("institucion");
                setShowDropdown(true);
                if (formErrors.institucion) setFormErrors(prev => ({ ...prev, institucion: false }));
              }}
            />
            {showDropdown && filteredInstituciones.length > 0 && (
              <ul className="edit_dropdown_list">
                {filteredInstituciones.map((inst) => (
                  <li
                    key={inst.id}
                    onClick={() => {
                      setInstitucion(inst.nombre);
                      setShowDropdown(false);
                      trackChange("institucion");
                    }}
                  >
                    {inst.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label>Ubicación</label>
          <input
            className={`edit_input ${isModified.lugarInstitucion ? "text_black" : "text_gray"} ${formErrors.lugarInstitucion ? "input_error" : ""}`}
            value={lugarInstitucion}
            placeholder="Ej: Buffet, Cancha 3, Entrada principal"
            onChange={(e) => {
              setLugarInstitucion(e.target.value);
              trackChange("lugarInstitucion");
              if (formErrors.lugarInstitucion) setFormErrors(prev => ({ ...prev, lugarInstitucion: false }));
            }}
          />

          <label>Descripción adicional</label>
          <textarea
            className={`edit_textarea ${isModified.descripcion ? "text_black" : "text_gray"} ${formErrors.descripcion ? "input_error" : ""}`}
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              trackChange("descripcion");
              if (formErrors.descripcion) setFormErrors(prev => ({ ...prev, descripcion: false }));
            }}
          />
        </section>

        <div className="edit_buttons_group">
          <button className="edit_btn_discard" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Descartar
          </button>
          <button className="edit_btn_save" onClick={handleSaveChanges} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>

        <p className="edit_bottom_notice">
          Al publicar, notificaremos a la comunidad para que el objeto regrese a su dueño lo antes posible.
        </p>
      </main>

      <Footer />

      {/* MODAL DE ÉXITO */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="¡Cambios guardados!"
        variant="success"
        icon={<Check size={32} strokeWidth={3} />}
        confirmText="Aceptar"
        onConfirm={() => navigate(`/home`)}
      />

      {/* MODAL DE ERRORES DEL BACKEND */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="No se pudo guardar"
        description="Por favor, corrige los siguientes campos requeridos por el sistema:"
        variant="error"
        icon={<X size={32} strokeWidth={3} />}
        confirmText="Entendido"
      >
        <div className="error_list_container">
          {backendErrors.map((err, idx) => (
            <div key={idx} className="error_list_item">
              <span className="error_item_bullet">!</span>
              <span className="error_item_text">{err}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default EditPublicationPage;