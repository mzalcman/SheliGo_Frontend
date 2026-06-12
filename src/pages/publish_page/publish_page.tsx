import "./publish_page.css";
import { useState } from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ImageUploader from "../../components/image_uploader/image_uploader";
import { Send } from "lucide-react";
import InstitutionAutocomplete from "../../components/institution_autocomplete/institution_autocomplete";
import {create_publication,} from "../../services/publication_service";

const PublishPage = () => {
  const [images, setImages] =
    useState<File[]>([]);
  const [nombre, setNombre] =
    useState("");
  const [tipo, setTipo] =
    useState("");
  const [categoriaId, setCategoriaId] =
    useState("");
  const [fechaEvento, setFechaEvento] =
    useState("");
  const [lugarInstitucion,
    setLugarInstitucion] =
    useState("");
  const [descripcion,
    setDescripcion] =
    useState("");
  const [institucion,
    setInstitucion] =
    useState("");
  const categorias = [
    {
      id: "1",
      nombre: "Mochilas",
    },
    {
      id: "2",
      nombre: "Llaves",
    },
    {
      id: "3",
      nombre: "Botellas",
    },
  ];

  const instituciones = [
    {
      id: "1",
      nombre: "Club SheliGo",
    },
    {
      id: "2",
      nombre: "ORT",
    },
    {
      id: "3",
      nombre: "Macabi",
    },
  ];
  
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

    alert(
      "Completa todos los campos obligatorios."
    );

    return;
  }

  const institucionValida =
    instituciones.some(
      (item) =>
        item.nombre === institucion
    );

  if (!institucionValida) {

    alert(
      "Debes seleccionar una institución válida."
    );

    return;
  }

  const formData =
    new FormData();

  formData.append(
    "nombre",
    nombre
  );

  formData.append(
    "tipo",
    tipo
  );

  formData.append(
    "categoria_id",
    categoriaId
  );

  formData.append(
    "fecha_evento",
    fechaEvento
  );

  formData.append(
    "lugar_institucion",
    lugarInstitucion
  );

  formData.append(
    "descripcion",
    descripcion
  );

  formData.append(
    "institucion_id",
    institucion
  );

  images.forEach(
    (image) => {

      formData.append(
        "imagenes",
        image
      );

    }
  );

  console.log(
    "FORM DATA:"
  );

  for (
    const [key, value]
    of formData.entries()
  ) {

    console.log(
      key,
      value
    );

  }

  /*
  Cuando exista el endpoint:

  try {

    await create_publication(
      formData
    );

    alert(
      "Publicación creada"
    );

  } catch (error) {

    alert(
      "Error al publicar"
    );

  }
  */
};

  return (
    <div className="publish_page">

      <Header />

      <main className="publish_content">

        <h1 className="publish_title">
          Publicar Objeto
        </h1>

        <p className="publish_subtitle">
          Ayúdanos a devolverle al club
          lo que alguien perdió.
        </p>

        <ImageUploader
          images={images}
          setImages={setImages}/>

        <section className="publish_form">

          <label>
            ¿Qué encontraste o perdiste?
          </label>

          <input
            className="publish_input"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
          />

          <label>
            Estado del objeto
          </label>

          <select
            className="publish_input"
            value={tipo}
            onChange={(e) =>
              setTipo(
                e.target.value
              )
            }
          >
            <option value="">
              Selecciona una opción
            </option>

            <option value="perdido">
              Perdido
            </option>

            <option value="encontrado">
              Encontrado
            </option>

          </select>

          <label>
            Categoría
          </label>

          <select
            className="publish_input"
            value={categoriaId}
            onChange={(e) =>
              setCategoriaId(
                e.target.value
              )
            }
          >
            <option value="">
              Selecciona una categoría
            </option>

            {categorias.map(
              (categoria) => (
                <option
                  key={categoria.id}
                  value={categoria.id}
                >
                  {categoria.nombre}
                </option>
              )
            )}

          </select>

          <label>
            Fecha del evento
          </label>

          <input
            type="date"
            className="publish_input"
            value={fechaEvento}
            onChange={(e) =>
              setFechaEvento(
                e.target.value
              )
            }
          />

          <label>
            Ubicación
          </label>

          <input
            className="publish_input"
            placeholder="¿En qué parte del club?"
            value={lugarInstitucion}
            onChange={(e) =>
              setLugarInstitucion(
                e.target.value
              )
            }
          />

          <label>
            Descripción adicional
          </label>

          <textarea
            className="publish_textarea"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
          />

          <label>
            Institución
          </label>

          <InstitutionAutocomplete
            value={institucion}
            onChange={
              setInstitucion
            }
            institutions={
              instituciones
            }
          />

        </section>

        <button
          className="publish_button"
          onClick={handlePublish}
        >
          <span>Publicar Objeto</span>

          <Send
            size={20}
            strokeWidth={2.5}
          />
        </button>

      </main>

      <Footer />

    </div>
  );
};

export default PublishPage;