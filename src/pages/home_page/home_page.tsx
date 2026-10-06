import "./home_page.css";
import { useEffect, useState } from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ActionCard from "../../components/action_card/action_card";
import InstitutionLogos from "../../components/institution_logos/institution_logos";
import RecentObjectsCarousel from "../../components/recent_objects_carousel/recent_objects_carousel";
import { useNavigate } from "react-router-dom";
import { get_home_publications, get_home_institutions } from "../../services/home_service";
import Loader from "../../components/loader/loader";
import { useAuth } from "../../hooks/use_auth";
import { api } from "../../services/api";
import type { Publication } from "../../types/publication";

const HomePage = () => {
  const [publications, set_publications] = useState<Publication[]>([]);
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
          const pubsRaw: Publication[] =
            publications_data?.publicaciones ||
            publications_data?.data?.publicaciones ||
            (Array.isArray(publications_data) ? publications_data : []);

          const instsRaw =
            institutions_data?.instituciones ||
            institutions_data?.data?.instituciones ||
            (Array.isArray(institutions_data) ? institutions_data : []);

          set_publications(pubsRaw);
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
      <main className="page_container">
        <section className="home_hero">
          <span className="eyebrow">Porque lo tuyo vuelve</span>
          <h1 className="home_title">
            Hola, <span>{user?.nombre || user?.name || "Usuario"}</span>!
          </h1>
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

        {institutions.length > 0 && (
          <section className="home_section">
            <div className="home_section_header">
              <h2 className="section_title">Instituciones</h2>
            </div>
            <InstitutionLogos institutions={institutions} limit={10} />
          </section>
        )}

        <section className="home_section">
          <div className="home_section_header">
            <h2 className="section_title">Objetos Recientes</h2>
          </div>
          <RecentObjectsCarousel objects={publications} limit={20} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;