import "./publish_page.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { ArrowLeft, Send, Check, X, Save } from "lucide-react";
import {
  create_publication,
  update_publication,
  get_publication_by_id,
  getCategories,
  getInstitutions
} from "../../services/publication_service";
import Modal from "../../components/modal/modal";


interface BackendItem {
  id: string;
  nombre: string;
}


export interface PublishFormData {
  nombre: string;
  tipo: string;
  categoriaId: string;
  fechaEvento: string;
  lugarInstitucion: string;
  descripcion: string;
  institucion: string;
}


interface PublishPageProps {
  onFormSubmitSuccess?: (data: PublishFormData) => void;
}


const PublishPage = ({ onFormSubmitSuccess }: PublishPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);


  const [categorias, setCategorias] = useState<BackendItem[]>([]);
  const [instituciones, setInstituciones] = useState<BackendItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);


  const [filteredInstituciones, setFilteredInstituciones] = useState<BackendItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [loadingData, setLoadingData] = useState(false);


  const todayStr = new Date().toISOString().split("T")[0];


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PublishFormData>({
    defaultValues: {
      nombre: "",
      tipo: "",
      categoriaId: "",
      fechaEvento: "",
      lugarInstitucion: "",
      descripcion: "",
      institucion: ""
    },
    mode: "onTouched"
  });


  const institucionValue = watch("institucion");


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
    if (isEditing && id) {
      const fetchPublicacion = async () => {
        try {
          setLoadingData(true);
          // get_publication_by_id retorna directamente la entidad 'publicacion'
          const pub = await get_publication_by_id(id);


          reset({
            nombre: pub.nombre || "",
            tipo: pub.tipo || "",
            categoriaId: pub.categoria_id || pub.categoria?.id || "",
            fechaEvento: pub.fecha_evento ? pub.fecha_evento.split("T")[0] : "",
            lugarInstitucion: pub.lugar_institucion || "",
            descripcion: pub.descripcion || "",
            institucion: pub.institucion?.nombre || pub.institucion_nombre || ""
          });
        } catch (error) {
          console.error("Error al obtener la publicación:", error);
          setBackendErrors(["No se pudo cargar la información de la publicación."]);
          setShowErrorModal(true);
        } finally {
          setLoadingData(false);
        }
      };


      fetchPublicacion();
    } else {
      reset({
        nombre: "",
        tipo: "",
        categoriaId: "",
        fechaEvento: "",
        lugarInstitucion: "",
        descripcion: "",
        institucion: ""
      });
      setImages([]);
    }
  }, [id, isEditing, reset]);


  useEffect(() => {
    const val = institucionValue || "";
    if (val.trim() === "") {
      setFilteredInstituciones([]);
    } else {
      const filtradas = instituciones.filter((inst) =>
        inst.nombre.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredInstituciones(filtradas);
    }
  }, [institucionValue, instituciones]);


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


  const onSubmit = async (data: PublishFormData) => {
    setBackendErrors([]);


    const institucionEncontrada = instituciones.find(
      (item) => item.nombre.toLowerCase() === data.institucion.trim().toLowerCase()
    );


    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("tipo", data.tipo);
    formData.append("categoria_id", data.categoriaId);
    formData.append("fecha_evento", `${data.fechaEvento}T00:00:00`);
    formData.append("lugar_institucion", data.lugarInstitucion);
    formData.append("descripcion", data.descripcion);
    formData.append("institucion_id", institucionEncontrada ? institucionEncontrada.id : "");


    images.forEach((image) => {
      formData.append("imagenes", image);
    });


    try {
      if (isEditing && id) {
        await update_publication(id, formData);
      } else {
        await create_publication(formData);
      }


      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(data);
      }


      setShowModal(true);
    } catch (error: any) {
      console.error("Error al procesar la publicación:", error);


      let mensajesError: string[] = [];
      if (error.response && error.response.data) {
        const resData = error.response.data;
        if (Array.isArray(resData.errors)) {
          resData.errors.forEach((err: any) => {
            if (typeof err === "object" && err.message) {
              mensajesError.push(err.message);
            } else if (typeof err === "string") {
              mensajesError.push(err);
            }
          });
        } else if (resData.message) {
          mensajesError = [resData.message];
        }
      }


      if (mensajesError.length === 0) {
        mensajesError = ["Ocurrió un error inesperado al procesar la publicación."];
      }


      setBackendErrors(mensajesError);
      setShowErrorModal(true);
    }
  };


  const handleModalAccept = () => {
    setShowModal(false);
    reset();
    setImages([]);
    navigate("/home");
  };


  if (loadingData) {
    return (
      <div className="publish_page">
        <Header />
        <main className="publish_content" style={{ textAlign: "center", paddingTop: "50px" }}>
          <p>Cargando información del objeto...</p>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="publish_page">
      <Header />


      <main className="publish_content">
        <div className="publish_header_title">
          <button
            className="publish_back_btn"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={24} color="#ff6f00" strokeWidth={2.5} />
          </button>
          <h1 className="publish_title">
            {isEditing ? "Editar objeto" : "Publicar objeto"}
          </h1>
        </div>  


        <p className="publish_subtitle">
          {isEditing
            ? "Modifica los datos necesarios de tu publicación."
            : "Ayúdanos a devolverle al club lo que alguien perdió."}
        </p>


        <ImageUploader images={images} setImages={setImages} />


        <form className="publish_form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form_group">
            <label>¿Qué encontraste o perdiste?</label>
            <input
              className={`publish_input ${errors.nombre ? "input_error" : ""}`}
              placeholder="Ej: buzo azul"
              maxLength={110}
              {...register("nombre", {
                required: "El nombre del objeto es obligatorio.",
                minLength: {
                  value: 3,
                  message: "El nombre debe tener al menos 3 caracteres."
                },
                maxLength: {
                  value: 100,
                  message: "El nombre no puede superar los 100 caracteres."
                }
              })}
            />
            {errors.nombre && <span className="field_error">{errors.nombre.message}</span>}
          </div>


          <div className="form_group">
            <label>Estado del objeto</label>
            <select
              className={`publish_input ${errors.tipo ? "input_error" : ""}`}
              {...register("tipo", {
                required: "Debe seleccionar si el objeto fue perdido o encontrado."
              })}
            >
              <option value="">Selecciona una opción</option>
              <option value="perdido">Perdido</option>
              <option value="encontrado">Encontrado</option>
            </select>
            {errors.tipo && <span className="field_error">{errors.tipo.message}</span>}
          </div>


          <div className="form_group">
            <label>Categoría</label>
            <select
              className={`publish_input ${errors.categoriaId ? "input_error" : ""}`}
              {...register("categoriaId", {
                required: "Debe seleccionar una categoría para el objeto."
              })}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && <span className="field_error">{errors.categoriaId.message}</span>}
          </div>


          <div className="form_group">
            <label>Fecha del evento</label>
            <input
              type="date"
              max={todayStr}
              className={`publish_input ${errors.fechaEvento ? "input_error" : ""}`}
              {...register("fechaEvento", {
                required: "La fecha del evento es obligatoria.",
                validate: (value) => {
                  const selectedDate = new Date(`${value}T00:00:00`);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  if (isNaN(selectedDate.getTime())) {
                    return "La fecha ingresada no es válida.";
                  }
                  if (selectedDate > today) {
                    return "La fecha del evento no puede ser posterior al día de hoy.";
                  }
                  return true;
                }
              })}
            />
            {errors.fechaEvento && <span className="field_error">{errors.fechaEvento.message}</span>}
          </div>


          <div className="form_group">
            <label>Ubicación</label>
            <input
              className={`publish_input ${errors.lugarInstitucion ? "input_error" : ""}`}
              placeholder="¿En qué parte del club?"
              {...register("lugarInstitucion", {
                maxLength: {
                  value: 100,
                  message: "La ubicación no puede superar los 100 caracteres."
                }
              })}
            />
            {errors.lugarInstitucion && <span className="field_error">{errors.lugarInstitucion.message}</span>}
          </div>


          <div className="form_group">
            <label>Descripción adicional</label>
            <textarea
              className={`publish_textarea ${errors.descripcion ? "input_error" : ""}`}
              placeholder="Escribe aquí..."
              {...register("descripcion", {
                maxLength: {
                  value: 1000,
                  message: "La descripción no puede superar los 1000 caracteres."
                }
              })}
            />
            {errors.descripcion && <span className="field_error">{errors.descripcion.message}</span>}
          </div>


          <div className="form_group">
            <label>Institución</label>
            <div ref={autocompleteRef} className="autocomplete_container">
              <input
                className={`publish_input ${errors.institucion ? "input_error" : ""}`}
                placeholder="Selecciona una institución..."
                {...register("institucion", {
                  required: "Debe seleccionar una institución válida.",
                  validate: (value) => {
                    const matches = instituciones.some(
                      (item) => item.nombre.toLowerCase() === value.trim().toLowerCase()
                    );
                    return matches || "Debe seleccionar una institución válida de la lista.";
                  }
                })}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setValue("institucion", e.target.value, { shouldValidate: true });
                  setShowDropdown(true);
                }}
              />


              {showDropdown && filteredInstituciones.length > 0 && (
                <ul className="autocomplete_dropdown">
                  {filteredInstituciones.map((inst) => (
                    <li
                      key={inst.id}
                      onClick={() => {
                        setValue("institucion", inst.nombre, { shouldValidate: true });
                        setShowDropdown(false);
                      }}
                    >
                      {inst.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.institucion && <span className="field_error">{errors.institucion.message}</span>}
          </div>


          <button
            type="submit"
            className={`publish_button ${isSubmitting ? "button_loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span>{isEditing ? "Guardando..." : "Publicando..."}</span>
                <div className="spinner_small"></div>
              </>
            ) : (
              <>
                <span>{isEditing ? "Guardar Cambios" : "Publicar Objeto"}</span>
                {isEditing ? <Save size={20} strokeWidth={2.5} /> : <Send size={20} strokeWidth={2.5} />}
              </>
            )}
          </button>
        </form>
      </main>


      <Footer />


      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? "¡Cambios guardados!" : "¡Publicación exitosa!"}
        description={isEditing
          ? "Tu publicación ha sido actualizada con éxito."
          : "Tu objeto ya se encuentra visible para toda la comunidad de SheliGo."}
        variant="success"
        icon={<Check size={32} strokeWidth={3} />}
        onConfirm={handleModalAccept}
      />


      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={isEditing ? "No se pudo actualizar" : "No se pudo publicar"}
        description="Ocurrieron los siguientes inconvenientes:"
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

