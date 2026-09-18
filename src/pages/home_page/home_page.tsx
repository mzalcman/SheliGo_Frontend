import "./home_page.css";
import { useEffect, useState } from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ActionCard from "../../components/action_card/action_card";
import InstitutionLogos from "../../components/institution_logos/institution_logos";
import RecentObjectsCarousel, { type ObjectType } from "../../components/recent_objects_carousel/recent_objects_carousel";
import { useNavigate } from "react-router-dom";
import { get_home_publications, get_home_institutions } from "../../services/home_service";
import Loader from "../../components/loader/loader";
import { useAuth } from "../../hooks/use_auth";
import { api } from "../../services/api";

const HomePage = () => {
  const [publications, set_publications] = useState<ObjectType[]>([]);
  const [institutions, set_institutions] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      return;
    }

    const fetch_data = async () => {
      try {
        if (isMounted) {
          set_loading(true);
        }

        const token = localStorage.getItem("token");
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        const [publications_data, institutions_data] = await Promise.all([
          get_home_publications(),
          get_home_institutions(),
        ]);

        if (isMounted) {
          const pubsRaw: any[] =
            publications_data?.publicaciones ||
            publications_data?.data?.publicaciones ||
            (Array.isArray(publications_data) ? publications_data : []);

          const instsRaw =
            institutions_data?.instituciones ||
            institutions_data?.data?.instituciones ||
            (Array.isArray(institutions_data) ? institutions_data : []);

          // 1. Extraer los IDs de las instituciones del usuario de manera flexible
          const misInstitucionesIds = (user?.instituciones || []).map(
            (inst: any) => String(inst.id || inst.institucion_id || inst).trim().toLowerCase()
          );

          console.log("IDs de Mis Instituciones:", misInstitucionesIds);

          // 2. Filtrar publicaciones tolerando diferentes nombres de propiedad en la API
          const pubsFiltradas = pubsRaw.filter((pub: any) => {
            const idInstPub = String(
              pub.institucion_id || 
              pub.id_institucion || 
              pub.institucion?.id || 
              pub.institucion
            ).trim().toLowerCase();

            return misInstitucionesIds.includes(idInstPub);
          });

          // 3. Mapear al tipo que necesita 'RecentObjectsCarousel'
          const pubsMapeadas: ObjectType[] = pubsFiltradas.map((pub: any) => ({
            id: String(pub.id),
            nombre: pub.nombre || pub.titulo || "Sin título",
            lugar_institucion:
              pub.lugar_institucion ||
              pub.institucion?.nombre ||
              pub.lugar ||
              "Ubicación no especificada",
            tipo: pub.tipo || pub.estado || pub.categoria || "Perdido",
            foto_principal_url:
              pub.foto_principal_url ||
              pub.foto ||
              (pub.fotos && pub.fotos[0]) ||
              "",
            fecha_evento: pub.fecha_evento || pub.created_at || pub.fecha || "",
          }));

          set_publications(pubsMapeadas);
          set_institutions(instsRaw);
        }
      } catch (error) {
        console.error("Error al traer datos del Home:", error);
      } finally {
        if (isMounted) {
          set_loading(false);
        }
      }
    };

    fetch_data();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user || loading) {
    return <Loader />;
  }

  return (
    <div className="home_page">
      <Header />
      <main className="home_page_content">
        <section className="home_hero">
          <h1 className="home_title">Hola, {user?.nombre || user?.name || "Usuario"}!</h1>
          <p className="home_subtitle">¿Has perdido algo hoy o encontraste un tesoro ajeno?</p>
        </section>

        <section className="home_actions">
          <ActionCard
            title="Perdí Algo"
            subtitle="Iniciar Búsqueda"
            background_color="#FF6F00"
            icon="search"
            onClick={() => navigate("/buscar")}
          />
          <ActionCard
            title="Encontré Algo"
            subtitle="Publicar hallazgo"
            background_color="#FFC107"
            icon="check"
            onClick={() => navigate("/publicar")}
          />
        </section>

        <InstitutionLogos institutions={institutions} limit={10} />
        
        <section className="recent_section">
          <h2 className="recent_title">Objetos Recientes</h2>
          <RecentObjectsCarousel objects={publications} limit={20} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;