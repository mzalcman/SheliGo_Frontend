import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Inbox, Plus } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ObjectCard from "../../components/object_card/object_card";
import { get_my_publications } from "../../services/publication_service";
import { getImageUrl } from "../../utils/get_image_url";
import EmptyState from "../../components/empty_state/empty_state";
import "./my_publications_page.css";

interface BackendPublication {
  id: string;
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  estado?: string;
  lugar_institucion?: string;
  categoria_nombre?: string;
  institucion_nombre?: string;
  institucion_direccion?: string;
  foto_principal_url?: string;
  foto_principal_mime_type?: string | null;
  fecha_evento?: string;
}

const MyPublicationsPage = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<BackendPublication[]>([]);
  const [loading, setLoading] = useState(true);

  const parseLocation = (pub: BackendPublication): string => {
    if (!pub) return "Ubicación no especificada";
    const lugar = pub.lugar_institucion || "";
    const inst = pub.institucion_nombre || "";
    if (lugar && inst) return `${lugar} (${inst})`;
    return lugar || inst || "Ubicación no especificada";
  };

  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      try {
        const resBody = await get_my_publications();
        const listaRaw = resBody?.data?.publicaciones || resBody?.publicaciones || (Array.isArray(resBody) ? resBody : []);
        setPublications(listaRaw);
      } catch (error) {
        console.error("Error al obtener las publicaciones del usuario:", error);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMisPublicaciones();
  }, []);

  return (
    <div className="mypubs_container">
      <Header />

      <main className="page_container">
        <div className="page_topbar">
          <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h1 className="page_title">Mis Publicaciones</h1>
        </div>

        <section className="mypubs_activity_section">
          <div className="mypubs_activity_text">
            <span className="eyebrow">TU ACTIVIDAD</span>
            <h2 className="mypubs_headline">Gestiona tus hallazgos</h2>
            <p className="mypubs_description">
              {publications.length === 0
                ? "Aún no has reportado ningún objeto. Tus publicaciones activas aparecerán listadas aquí para ayudarte a gestionarlas fácilmente."
                : `Has reportado ${publications.length} ${publications.length === 1 ? 'objeto' : 'objetos'}. Mantén tus publicaciones actualizadas para ayudar a la comunidad.`
              }
            </p>
          </div>

          <div className="mypubs_badge_banner">
            <span className="mypubs_badge_count">{publications.length}</span>
            <span className="mypubs_badge_text">
              {publications.length === 1 ? "OBJETO TOTAL" : "OBJETOS TOTALES"}
            </span>
          </div>
        </section>

        {loading ? (
          <div className="mypubs_loading_spinner">
            <div className="spinner"></div>
            <p>Buscando tus publicaciones...</p>
          </div>
        ) : publications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="¡Aún no publicaste nada!"
            description="¿Encontraste un objeto perdido o estás buscando algo que se te cayó? Publícalo para que la comunidad pueda ayudarte."
          >
            <button
              className="btn btn_primary"
              onClick={() => navigate("/publicar")}
            >
              <Plus size={18} strokeWidth={2.4} />
              Crear mi primera publicación
            </button>
          </EmptyState>
        ) : (
          <div className="mypubs_grid">
            {publications.map((pub) => {
              if (!pub || !pub.id) return null;

              return (
                <ObjectCard
                  key={pub.id}
                  id={pub.id}
                  title={pub.nombre || "Sin título"}
                  status={pub.tipo || "perdido"}
                  location={parseLocation(pub)}
                  image={getImageUrl(pub.foto_principal_url)}
                  createdAt={pub.fecha_evento}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyPublicationsPage;