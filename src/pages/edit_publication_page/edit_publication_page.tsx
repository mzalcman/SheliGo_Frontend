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

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Ejecutamos la consulta de las categorías, instituciones, la publicación Y las fotos en paralelo 🚀
        const [categoriasRes, institucionesRes, pubData, fotosRes] = await Promise.all([
          getCategories(),
          getInstitutions(),
          get_publication_by_id(id!),
          get_publication_photos(id!) // 👈 Nueva consulta de fotos
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

          // 📸 Procesamos las fotos recibidas del endpoint /:id/archivos
          const fotosRaw = fotosRes || [];
          let imagenesProcesadas: PublicationImage[] = [];

          if (Array.isArray(fotosRaw)) {
            imagenesProcesadas = fotosRaw.map((img: any) => {
              if (typeof img === "string") {
                return { id: img, url: img };
              }
              // Mapeamos según lo que devuelva el backend: 'ruta', 'nombre_servidor' o 'url'
              // Si tu backend guarda solo el nombre de archivo (ej: "foto.jpg"), le concatenamos la URL base
              const urlFoto = img.url || img.ruta || img.nombre_servidor || "";
              const urlCompleta = urlFoto.startsWith("http")
                ? urlFoto
                : `http://localhost:3000/uploads/${urlFoto}`; // 👈 Ajustá "/uploads/" si tu carpeta estática se llama distinto

              return {
                id: String(img.id || img.ruta || img.nombre_servidor || ""),
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
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("categoria_id", categoriaId);
    formData.append("fecha_evento", fechaEvento);
    formData.append("lugar_institucion", lugarInstitucion);
    formData.append("descripcion", descripcion);

    // Buscamos si la institución escrita coincide con alguna de la lista
    const institucionEncontrada = instituciones.find(
      (item) => item.nombre.toLowerCase() === institucion.trim().toLowerCase()
    );

    // Si existe, mandamos su ID. Si no existe (o está vacío), mandamos vacío 
    // para que el backend salte y nos diga "La institución es obligatoria o inválida"
    formData.append("institucion_id", institucionEncontrada ? institucionEncontrada.id : "");

    // Calculamos qué imágenes originales se eliminaron
    const fotosAEliminar = originalBackendImages
      .filter(origImg => !existingImages.some(currImg => currImg.id === origImg.id))
      .map(img => img.id);

    fotosAEliminar.forEach((idFoto) => {
      formData.append("fotosAEliminar[]", idFoto);
    });

    if (newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append("imagenes", image);
      });
    }

    try {
      // Mandamos todo al back de una, sin frenos locales 🚀
      await update_publication(id!, formData);
      setShowModal(true); // Si sale bien, abrimos el modal de éxito
    } catch (error: any) {
      console.error("Error al guardar cambios:", error);

      if (error?.response?.status === 403) {
        setBackendErrors(["No tienes permisos para editar esta publicación."]);
        setShowErrorModal(true);
      } else if (error?.response?.data?.errors) {
        // 👈 ASUMIENDO QUE TU BACKEND DEVUELVE UN ARRAY DE ERRORES EN: error.response.data.errors
        // Adaptá "error.response.data.errors" u "error.response.data.message" según tu API.
        const erroresDelServidor = Array.isArray(error.response.data.errors)
          ? error.response.data.errors
          : [error.response.data.message || "Error desconocido en el servidor."];

        setBackendErrors(erroresDelServidor);
        setShowErrorModal(true);
      } else {
        setBackendErrors(["Hubo un error inesperado al actualizar los datos."]);
        setShowErrorModal(true);
      }
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

        <h1 className="edit_title">Publicar Objeto</h1>
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
          <button className="edit_btn_discard" onClick={() => navigate(-1)}>
            Descartar
          </button>
          <button className="edit_btn_save" onClick={handleSaveChanges}>
            Guardar
          </button>
        </div>

        <p className="edit_bottom_notice">
          Al publicar, notificaremos a la comunidad para que el objeto regrese a su dueño lo antes posible.
        </p>
      </main>

      <Footer />
      {/* 🟢 MODAL DE ÉXITO */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="¡Cambios guardados!"
        variant="success"
        icon={<Check size={32} strokeWidth={3} />}
        confirmText="Aceptar"
        onConfirm={() => navigate(`/home`)}
      />

      {/* 🔴 MODAL DE ERRORES DEL BACKEND */}
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