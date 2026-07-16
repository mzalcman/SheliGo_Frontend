import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Loader from "../../components/loader/loader";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { ArrowLeft, Check } from "lucide-react";
import { 
  getCategories, 
  getInstitutions, 
  get_publication_by_id, 
  update_publication 
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

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categoriasRes, institucionesRes, pubData] = await Promise.all([
          getCategories(),
          getInstitutions(),
          get_publication_by_id(id!)
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

          if (pubData.imagenes) {
            let imagenesProcesadas: PublicationImage[] = [];
            if (Array.isArray(pubData.imagenes)) {
              imagenesProcesadas = pubData.imagenes.map((img: any) => {
                if (typeof img === "string") {
                  return { id: img, url: img };
                }
                return {
                  id: img.id || img.url || img.ruta || "",
                  url: img.url || img.ruta || ""
                };
              }).filter((img) => img.url !== "");
            } else if (typeof pubData.imagenes === "string") {
              imagenesProcesadas = [{ id: pubData.imagenes, url: pubData.imagenes }];
            }
            
            setOriginalBackendImages(imagenesProcesadas);
            setExistingImages(imagenesProcesadas);
          }
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
    const errors: Record<string, boolean> = {
      nombre: !nombre.trim(),
      tipo: !tipo,
      categoriaId: !categoriaId,
      fechaEvento: !fechaEvento,
      lugarInstitucion: !lugarInstitucion.trim(),
      descripcion: !descripcion.trim(),
      institucion: !institucion.trim(),
    };

    setFormErrors(errors);
    if (Object.values(errors).some(isError => isError)) return;

    const institucionEncontrada = instituciones.find(
      (item) => item.nombre.toLowerCase() === institucion.trim().toLowerCase()
    );

    if (!institucionEncontrada) {
      setFormErrors(prev => ({ ...prev, institucion: true }));
      alert("Selecciona una institución válida de la lista.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("categoria_id", categoriaId);
    formData.append("fecha_evento", fechaEvento);
    formData.append("lugar_institucion", lugarInstitucion);
    formData.append("descripcion", descripcion);
    formData.append("institucion_id", institucionEncontrada.id);

    // 🎯 Calculamos qué imágenes originales se eliminaron
    const fotosAEliminar = originalBackendImages
      .filter(origImg => !existingImages.some(currImg => currImg.id === origImg.id))
      .map(img => img.id);

    // Mandamos los IDs a eliminar como valores planos, no JSON stringificado
    fotosAEliminar.forEach((idFoto) => {
      formData.append("fotosAEliminar[]", idFoto);
    });

    // 🚀 Mandamos las imágenes nuevas solo si existen
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
      if (error?.response?.status === 403) {
        alert("No tienes permisos para editar esta publicación.");
      } else {
        alert("Hubo un error al actualizar los datos.");
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
                    >
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>✕</span>
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

      {/* Modal Éxito */}
      {showModal && (
        <div className="modal_overlay">
          <div className="modal_container">
            <div className="modal_icon_circle">
              <Check size={32} strokeWidth={3} className="modal_icon_check" />
            </div>
            <h2 className="modal_title">¡Cambios guardados!</h2>
            <button className="modal_accept_button" onClick={() => navigate(`/home`)}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPublicationPage;