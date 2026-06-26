import "./publish_page.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { Send, Check } from "lucide-react";
import { create_publication, getCategories, getInstitutions } from "../../services/publication_service";

interface BackendItem {
  id: string;
  nombre: string;
}

const PublishPage = () => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<BackendItem[]>([]);
  const [instituciones, setInstituciones] = useState<BackendItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<File[]>([]);
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
    if (
      !nombre ||
      !tipo ||
      !categoriaId ||
      !fechaEvento ||
      !lugarInstitucion ||
      !descripcion ||
      !institucion
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    const institucionEncontrada = instituciones.find(
      (item) => item.nombre.toLowerCase() === institucion.trim().toLowerCase()
    );

    if (!institucionEncontrada) {
      alert("Debes seleccionar una institución válida de la lista.");
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

    images.forEach((image) => {
      formData.append("imagenes", image);
    });

    try {
      await create_publication(formData);
      setShowModal(true);
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Error al publicar el objeto. Revisa los datos e intenta nuevamente.");
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
            className="publish_input"
            value={nombre}
            placeholder="Ej: buzo azul"
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>Estado del objeto</label>
          <select
            className={`publish_input ${!tipo ? "select_placeholder" : ""}`}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>

          <label>Categoría</label>
          <select
            className={`publish_input ${!categoriaId ? "select_placeholder" : ""}`}
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
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
            className={`publish_input ${!fechaEvento ? "date_placeholder" : ""}`}
            value={fechaEvento}
            onChange={(e) => setFechaEvento(e.target.value)}
          />

          <label>Ubicación</label>
          <input
            className="publish_input"
            placeholder="¿En qué parte del club?"
            value={lugarInstitucion}
            onChange={(e) => setLugarInstitucion(e.target.value)}
          />

          <label>Descripción adicional</label>
          <textarea
            className="publish_textarea"
            value={descripcion}
            placeholder="Escribe aquí..."
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <label>Institución</label>
          <div ref={autocompleteRef} className="autocomplete_container">
            <input
              className="publish_input"
              placeholder="Selecciona una institución..."
              value={institucion}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setInstitucion(e.target.value);
                setShowDropdown(true);
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

        <button className="publish_button" onClick={handlePublish}>
          <span>Publicar Objeto</span>
          <Send size={20} strokeWidth={2.5} />
        </button>
      </main>

      <Footer />

      {showModal && (
        <div className="modal_overlay">
          <div className="modal_container">
            <div className="modal_icon_circle">
              <Check size={32} strokeWidth={3} className="modal_icon_check" />
            </div>
            <h2 className="modal_title">¡Publicación exitosa!</h2>
            <p className="modal_text">
              Tu objeto ya se encuentra visible para toda la comunidad de SheliGo.
            </p>
            <button className="modal_accept_button" onClick={handleModalAccept}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishPage;