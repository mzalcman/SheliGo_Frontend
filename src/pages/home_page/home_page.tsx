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
import { AlertCircle } from "lucide-react";

const HomePage = () => {
  const [publications, set_publications] = useState([]);
  const [institutions, set_institutions] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, set_loading] = useState(true);
  const [hasError, set_hasError] = useState(false); 

  useEffect(() => {
    let isMounted = true; 

    if (!user) {
      return;
    }

    const fetch_data = async () => {
      try {
        if (isMounted) {
          set_loading(true);
          set_hasError(false);
        }

        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("⚠️ ALERTA: No se encontró ningún token bajo la clave 'token' en localStorage.");
        } else {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        const [publications_data, institutions_data] = await Promise.all([
          get_home_publications(),
          get_home_institutions(),
        ]);

        if (isMounted) {
          const pubs = publications_data?.publicaciones || publications_data?.data?.publicaciones || [];
          const insts = institutions_data?.instituciones || institutions_data?.data?.instituciones || [];
          
          set_publications(pubs);
          set_institutions(insts);
        }
      } catch (error) {
        console.error("Error crítico al traer datos del Home:", error);
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
            Hola, <span>{user?.name || "Usuario"}</span>!
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

        {hasError ? (
          <div className="home_error_notice animate_fade_in">
            <AlertCircle size={22} strokeWidth={2} />
            <div>
              <p className="home_error_title">No se pudieron cargar los objetos recientes.</p>
              <p className="home_error_text">
                Tu sesión pudo haber expirado. Si el problema persiste, probá{" "}
                <button className="btn_text" onClick={() => navigate("/login")}>
                  iniciando sesión de nuevo
                </button>.
              </p>
            </div>
          </div>
        ) : (
          <>
            {institutions.length > 0 && (
              <section className="home_section">
                <div className="home_section_header">
                  <h2 className="section_title">Instituciones</h2>
                </div>
                <InstitutionLogos institutions={institutions} limit={10}/>
              </section>
            )}

            <section className="home_section">
              <div className="home_section_header">
                <h2 className="section_title">Objetos Recientes</h2>
              </div>
              <RecentObjectsCarousel objects={publications} limit={20}/>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;  