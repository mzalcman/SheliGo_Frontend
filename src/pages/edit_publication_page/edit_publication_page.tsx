import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Loader from "../../components/loader/loader";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { ArrowLeft, Check, X, Info } from "lucide-react";
import Modal from "../../components/modal/modal";
import {
  getCategories,
  getInstitutions,
  get_publication_by_id,
  update_publication,
  get_publication_photos
} from "../../services/publication_service";
import StatusSelector from "../../components/status_selector/status_selector";
import "../../styles/form_layout.css";
import { getImageUrl } from "../../utils/get_image_url";

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
              if (typeof img === "string") {
                return { id: img, url: getImageUrl(img) };
              }

              const urlFoto = img.url || img.ruta || img.nombre_servidor || "";
              const urlCompleta = getImageUrl(urlFoto);

              const realId = String(
                img.id ?? img._id ?? img.foto_id ?? img.archivo_id ?? img.id_archivo ?? img.ruta ?? img.nombre_servidor ?? ""
              );

              return {
                id: realId,
                url: urlCompleta
              };
            }).filter((img) => img.url !== "");
          }

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

    // Mismas validaciones previas que en PublishPage
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
    // Validación de fecha (evitar fechas futuras)
    if (!fechaEvento) {
      errors.fechaEvento = true;
      messages.push("La fecha ingresada no es válida.");
    } else {
      const selectedDate = new Date(`${fechaEvento}T00:00:00`);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Incluir todo el día actual

      if (isNaN(selectedDate.getTime())) {
        errors.fechaEvento = true;
        messages.push("La fecha ingresada no es válida.");
      } else if (selectedDate > today) {
        errors.fechaEvento = true;
        messages.push("La fecha del evento no puede ser posterior al día de hoy.");
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

    // 1. Campos de texto
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("categoria_id", categoriaId);
    formData.append("fecha_evento", `${fechaEvento}T00:00:00`);
    formData.append("lugar_institucion", lugarInstitucion);
    formData.append("descripcion", descripcion);
    formData.append("institucion_id", institucionEncontrada ? String(institucionEncontrada.id) : "");

    // 2. Fotos a eliminar (como JSON string)
    const fotosAEliminar = originalBackendImages
      .filter(origImg => !existingImages.some(currImg => currImg.id === origImg.id))
      .map(img => img.id);

    if (fotosAEliminar.length > 0) {
      formData.append("fotosAEliminar", JSON.stringify(fotosAEliminar));
    }

    // 3. Archivos de imagen nuevos (al final)
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
    return <Loader />;
  }

  return (
    <div className="edit_page">
      <Header />

      <main className="page_container narrow">
        <div className="page_topbar">
          <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <span className="eyebrow">Editar Publicación</span>
        </div>

        <header className="form_page_header">
          <h1 className="page_title">Modificar Objeto</h1>
          <p className="page_subtitle">
            Ayúdanos a devolverle el alma al club reportando lo que falta o lo que sobra.
          </p>
        </header>

        <section className="form_section">
          <div className="form_section_header">
            <span className="form_step">1</span>
            <div>
              <h2>Fotos</h2>
              <p>Podés quitar imágenes actuales o sumar nuevas (hasta 5).</p>
            </div>
          </div>

          <ImageUploader
            images={newImages}
            setImages={setNewImages}
            maxFiles={5 - existingImages.length}
          />

          {existingImages.length > 0 && (
            <div className="edit_backend_images_preview">
              <p className="form_label">Imágenes actuales de la publicación:</p>
              <div className="image_preview_container">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="image_preview_wrapper">
                    <img src={image.url} className="image_preview" alt="Existente backend" />
                    <button
                      type="button"
                      className="remove_image_button"
                      onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                      title="Eliminar imagen"
                      aria-label="Eliminar imagen"
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="form_section">
          <div className="form_section_header">
            <span className="form_step">2</span>
            <div>
              <h2>Detalles del objeto</h2>
              <p>Los campos que modifiques se resaltan.</p>
            </div>
          </div>

          <div className="form_field">
            <label className="form_label">¿Qué encontraste o perdiste?</label>
            <input
              className={`form_input ${isModified.nombre ? "text_black" : "text_gray"} ${formErrors.nombre ? "input_error" : ""}`}
              value={nombre}
              maxLength={45}
              onChange={(e) => {
                setNombre(e.target.value);
                trackChange("nombre");
                if (formErrors.nombre) setFormErrors(prev => ({ ...prev, nombre: false }));
              }}
            />
          </div>

          <div className="form_field">
            <label className="form_label">Estado del objeto</label>
            <StatusSelector
              value={tipo}
              has_error={!!formErrors.tipo}
              onChange={(value) => {
                setTipo(value);
                trackChange("tipo");
                if (formErrors.tipo) setFormErrors(prev => ({ ...prev, tipo: false }));
              }}
            />
          </div>

          <div className="form_field">
            <label className="form_label">Categoría</label>
            <select
              className={`form_select ${isModified.categoriaId ? "text_black" : "text_gray"} ${formErrors.categoriaId ? "input_error" : ""}`}
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
          </div>

          <div className="form_field">
            <label className="form_label">Descripción adicional</label>
            <textarea
              className={`form_textarea ${isModified.descripcion ? "text_black" : "text_gray"} ${formErrors.descripcion ? "input_error" : ""}`}
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                trackChange("descripcion");
                if (formErrors.descripcion) setFormErrors(prev => ({ ...prev, descripcion: false }));
              }}
            />
          </div>
        </section>

        <section className="form_section">
          <div className="form_section_header">
            <span className="form_step">3</span>
            <div>
              <h2>¿Cuándo y dónde?</h2>
              <p>Ubicá el objeto dentro de la institución.</p>
            </div>
          </div>

          <div className="form_field">
            <label className="form_label">¿Cuándo ocurrió?</label>
            <input
              type="date"
              max={todayStr}
              className={`form_input ${isModified.fechaEvento ? "text_black" : "text_gray"} ${formErrors.fechaEvento ? "input_error" : ""}`}
              value={fechaEvento}
              onChange={(e) => {
                setFechaEvento(e.target.value);
                trackChange("fechaEvento");
                if (formErrors.fechaEvento) setFormErrors(prev => ({ ...prev, fechaEvento: false }));
              }}
            />
          </div>

          <div className="form_field">
            <label className="form_label">Institución</label>
            <div className="autocomplete_container" ref={autocompleteRef}>
              <input
                className={`form_input ${isModified.institucion ? "text_black" : "text_gray"} ${formErrors.institucion ? "input_error" : ""}`}
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
                <ul className="autocomplete_dropdown">
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
          </div>

          <div className="form_field">
            <label className="form_label">Ubicación</label>
            <input
              className={`form_input ${isModified.lugarInstitucion ? "text_black" : "text_gray"} ${formErrors.lugarInstitucion ? "input_error" : ""}`}
              value={lugarInstitucion}
              placeholder="Ej: Buffet, Cancha 3, Entrada principal"
              onChange={(e) => {
                setLugarInstitucion(e.target.value);
                trackChange("lugarInstitucion");
                if (formErrors.lugarInstitucion) setFormErrors(prev => ({ ...prev, lugarInstitucion: false }));
              }}
            />
          </div>
        </section>

        <div className="form_actions">
          <button className="btn btn_ghost btn_lg" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Descartar
          </button>
          <button className="btn btn_primary btn_lg" onClick={handleSaveChanges} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span>Guardando...</span>
                <div className="spinner_small"></div>
              </>
            ) : "Guardar"}
          </button>
        </div>

        <p className="edit_bottom_notice">
          <Info size={16} strokeWidth={2.2} />
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
        icon={<Check size={28} strokeWidth={2.6} />}
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
        icon={<X size={28} strokeWidth={2.6} />}
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