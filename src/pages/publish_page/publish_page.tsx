import "./publish_page.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { Send } from "lucide-react";
import InstitutionAutocomplete from "../../components/institution_autocomplete/institution_autocomplete";
import { create_publication, getCategories, getInstitutions } from "../../services/publication_service";

interface BackendItem {
  id: string;
  nombre: string;
}

const PublishPage = () => {
  const navigate = useNavigate();

  // Estados de carga de datos dinámicos desde el Backend
  const [categorias, setCategorias] = useState<BackendItem[]>([]);
  const [instituciones, setInstituciones] = useState<BackendItem[]>([]);

  // Estados nativos del formulario
  const [images, setImages] = useState<File[]>([]);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [lugarInstitucion, setLugarInstitucion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [institucion, setInstitucion] = useState(""); // Captura el texto del input autocomplete

  // Carga e inspección de datos del Backend de manera segura
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [categoriasRes, institucionesRes] = await Promise.all([
          getCategories(),
          getInstitutions()
        ]);
        
        // Extracción segura para categorías (Prueba todas las variantes comunes de Axios)
        let listaCategorias: BackendItem[] = [];
        if (categoriasRes?.data?.categorias) listaCategorias = categoriasRes.data.categorias;
        else if (categoriasRes?.data) listaCategorias = Array.isArray(categoriasRes.data) ? categoriasRes.data : (categoriasRes.data.data || []);
        else if (Array.isArray(categoriasRes)) listaCategorias = categoriasRes;
        
        // Extracción segura para instituciones (Prueba todas las variantes comunes de Axios)
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

    // Buscamos el objeto de la institución para extraer su UUID correspondiente
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
    formData.append("institucion_id", institucionEncontrada.id); // UUID resuelto

    // Adjuntar los binarios multimedia
    images.forEach((image) => {
      formData.append("imagenes", image);
    });

    try {
      await create_publication(formData);
      alert("¡Objeto publicado con éxito!");
      navigate("/"); // Redirección directa al Feed principal
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Error al publicar el objeto. Revisa los datos e intenta nuevamente.");
    }
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
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>Estado del objeto</label>
          <select
            className="publish_input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>

          <label>Categoría</label>
          <select
            className="publish_input"
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
            className="publish_input"
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
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <label>Institución</label>
          <InstitutionAutocomplete
            value={institucion}
            onChange={setInstitucion}
            institutions={instituciones}
          />
        </section>

        <button className="publish_button" onClick={handlePublish}>
          <span>Publicar Objeto</span>
          <Send size={20} strokeWidth={2.5} />
        </button>
      </main>

      <Footer />
    </div>
  );
};

export default PublishPage;