import "./publish_page.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { Send, Check, X } from "lucide-react";
import { create_publication, getCategories, getInstitutions } from "../../services/publication_service";
import Modal from "../../components/modal/modal";

interface BackendItem {
  id: string;
  nombre: string;
}

const PublishPage = () => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<BackendItem[]>([]);
  const [instituciones, setInstituciones] = useState<BackendItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [lugarInstitucion, setLugarInstitucion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [institucion, setInstitucion] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  const [filteredInstituciones, setFilteredInstituciones] = useState<BackendItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [categoriasRes, institucionesRes] = await Promise.all([
          getCategories(),
          getInstitutions()
        ]);

        let listaCategorias: BackendItem[] = [];
        if (categoriasRes?.data?.categorias) listaCategorias = categoriasRes.data.categorias;
        else if (categoriasRes?.data) listaCategorias = Array.isArray(categoriasRes.data) ? categoriasRes.data : (categoriasRes.data.data || []);
        else if (Array.isArray(categoriasRes)) listaCategorias = categoriasRes;

        let listaInstituciones: BackendItem[] = [];
        if (institucionesRes?.data?.instituciones) listaInstituciones = institucionesRes.data.instituciones;
        else if (institucionesRes?.data) listaInstituciones = Array.isArray(institucionesRes.data) ? institucionesRes.data : (institucionesRes.data.data || []);
        else if (Array.isArray(institucionesRes)) listaInstituciones = institucionesRes;

        setCategorias(listaCategorias);
        setInstituciones(listaInstituciones);

      } catch (error) {
        console.error("Error al cargar los parámetros del formulario:", error);
      }
    };

    fetchBackendData();
  }, []);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePublish = async () => {
    if (isSubmitting) return;

    // Reiniciamos estados de error
    setFormErrors({});
    setBackendErrors([]);

    const errors: Record<string, boolean> = {};
    const messages: string[] = [];

    // 1. Validaciones del lado del Cliente basadas en tu Zod Schema (Crear de una vez el mapa de errores completo)
    if (!nombre.trim() || nombre.trim().length < 3) {
      errors.nombre = true;
      messages.push("El nombre debe tener al menos 3 caracteres.");
    }
    if (nombre.trim().length > 100) {
      errors.nombre = true;
      messages.push("El nombre no puede superar los 100 caracteres.");
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

    if (lugarInstitucion.trim().length > 100) {
      errors.lugarInstitucion = true;
      messages.push("La ubicación no puede superar los 100 caracteres.");
    }

    if (descripcion.trim().length > 1000) {
      errors.descripcion = true;
      messages.push("La descripción no puede superar los 1000 caracteres.");
    }

    const institucionEncontrada = instituciones.find(
      (item) => item.nombre.toLowerCase() === institucion.trim().toLowerCase()
    );

    if (!institucion.trim() || !institucionEncontrada) {
      errors.institucion = true;
      messages.push("La institución es inválida o no ha sido seleccionada de la lista.");
    }

    // Si hay algún error, interrumpimos la petición y marcamos TODO en naranja
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setBackendErrors(messages);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("categoria_id", categoriaId);
    formData.append("fecha_evento", `${fechaEvento}T00:00:00`);
    formData.append("lugar_institucion", lugarInstitucion);
    formData.append("descripcion", descripcion);
    formData.append("institucion_id", institucionEncontrada ? institucionEncontrada.id : "");

    images.forEach((image) => {
      formData.append("imagenes", image);
    });

    try {
      await create_publication(formData);
      setShowModal(true);
    } catch (error: any) {
      console.error("Error al publicar:", error);

      const nuevosErroresCampos: Record<string, boolean> = {};
      let mensajesError: string[] = [];

      if (error.response && error.response.data) {
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
        mensajesError = ["Ocurrió un error inesperado al procesar la publicación."];
      }

      setFormErrors(nuevosErroresCampos);
      setBackendErrors(mensajesError);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalAccept = () => {
    setShowModal(false);
    navigate("/home");
  };

  return (
    <div className="publish_page">
      <Header />

      <main className="publish_content">
        <h1 className="publish_title">Publicar Objeto</h1>

        <p className="publish_subtitle">
          Ayúdanos a devolverle al club lo que alguien perdió.
        </p>

        <ImageUploader images={images} setImages={setImages} />

        <section className="publish_form">
          <label>¿Qué encontraste o perdiste?</label>
          <input
            className={`publish_input ${formErrors.nombre ? "input_error" : ""}`}
            value={nombre}
            maxLength={110}
            placeholder="Ej: buzo azul"
            onChange={(e) => {
              setNombre(e.target.value);
              if (formErrors.nombre) setFormErrors(prev => ({ ...prev, nombre: false }));
            }}
          />

          <label>Estado del objeto</label>
          <select
            className={`publish_input ${!tipo ? "select_placeholder" : ""} ${formErrors.tipo ? "input_error" : ""}`}
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              if (formErrors.tipo) setFormErrors(prev => ({ ...prev, tipo: false }));
            }}
          >
            <option value="">Selecciona una opción</option>
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>

          <label>Categoría</label>
          <select
            className={`publish_input ${!categoriaId ? "select_placeholder" : ""} ${formErrors.categoriaId ? "input_error" : ""}`}
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              if (formErrors.categoriaId) setFormErrors(prev => ({ ...prev, categoriaId: false }));
            }}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <label>Fecha del evento</label>
          <input
            type="date"
            max={todayStr}
            className={`publish_input ${!fechaEvento ? "date_placeholder" : ""} ${formErrors.fechaEvento ? "input_error" : ""}`}
            value={fechaEvento}
            onChange={(e) => {
              setFechaEvento(e.target.value);
              if (formErrors.fechaEvento) setFormErrors(prev => ({ ...prev, fechaEvento: false }));
            }}
          />

          <label>Ubicación</label>
          <input
            className={`publish_input ${formErrors.lugarInstitucion ? "input_error" : ""}`}
            placeholder="¿En qué parte del club?"
            value={lugarInstitucion}
            onChange={(e) => {
              setLugarInstitucion(e.target.value);
              if (formErrors.lugarInstitucion) setFormErrors(prev => ({ ...prev, lugarInstitucion: false }));
            }}
          />

          <label>Descripción adicional</label>
          <textarea
            className={`publish_textarea ${formErrors.descripcion ? "input_error" : ""}`}
            value={descripcion}
            placeholder="Escribe aquí..."
            onChange={(e) => {
              setDescripcion(e.target.value);
              if (formErrors.descripcion) setFormErrors(prev => ({ ...prev, descripcion: false }));
            }}
          />

          <label>Institución</label>
          <div ref={autocompleteRef} className="autocomplete_container">
            <input
              className={`publish_input ${formErrors.institucion ? "input_error" : ""}`}
              placeholder="Selecciona una institución..."
              value={institucion}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setInstitucion(e.target.value);
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
                    }}
                  >
                    {inst.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <button
          className={`publish_button ${isSubmitting ? "button_loading" : ""}`}
          onClick={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span>Publicando...</span>
              <div className="spinner_small"></div>
            </>
          ) : (
            <>
              <span>Publicar Objeto</span>
              <Send size={20} strokeWidth={2.5} />
            </>
          )}
        </button>
      </main>

      <Footer />

      {/* Modal de éxito */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="¡Publicación exitosa!"
        description="Tu objeto ya se encuentra visible para toda la comunidad de SheliGo."
        variant="success"
        icon={<Check size={32} strokeWidth={3} />}
        onConfirm={handleModalAccept}
      />

      {/* Modal de Errores */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="No se pudo publicar"
        description="Por favor corrige los siguientes detalles:"
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

export default PublishPage;