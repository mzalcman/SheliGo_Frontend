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

const HomePage = () => {
  const [publications, set_publications] = useState([]);
  const [institutions, set_institutions] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, set_loading] = useState(true);
  const [hasError, set_hasError] = useState(false); 

  useEffect(() => {
    let isMounted = true; 

    const fetch_data = async () => {
      try {
        if (isMounted) {
          set_loading(true);
          set_hasError(false);
        }

        const [publications_data, institutions_data] = await Promise.all([
          get_home_publications(),
          get_home_institutions(),
        ]);

        if (isMounted) {
          set_publications(publications_data?.data?.publicaciones || []);
          set_institutions(institutions_data?.data?.instituciones || []);
        }
      } catch (error) {
        console.error("Error al traer datos del Home (401 Unauthorized u otro):", error);
        if (isMounted) {
          set_hasError(true);
        }
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
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (hasError) {
    return (
      <div className="home_page_error">
        <Header />
        <main style={{ padding: "40px", textAlign: "center" }}>
          <h2>No se pudieron cargar los datos</h2>
          <p>Tu sesión expiró o no tenés autorización (Error 401). Por favor, volvé a iniciar sesión.</p>
          <button onClick={() => navigate("/login")} style={{ marginTop: "15px", padding: "10px 20px" }}>
            Ir al Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home_page">
      <Header />
      <main className="home_page_content">
        <section className="home_hero">
          <h1 className="home_title">Hola, {user?.name}!</h1>
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
        <InstitutionLogos institutions={institutions} />
        <section className="recent_section">
          <h2 className="recent_title">Objetos Recientes</h2>
          <RecentObjectsCarousel objects={publications} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;