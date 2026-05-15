import "./home_page.css";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

import ActionCard from "../../components/action_card/action_card";
import InstitutionLogos from "../../components/institution_logos/institution_logos";
import RecentObjectsCarousel from "../../components/recent_objects_carousel/recent_objects_carousel";
import institutions from "../../data/institutions";
import recent_objects from "../../data/recent_objects";

const HomePage = () => {

  return (
    <div className="home_page">


      <main className="home_page_content">

        {/* Saludo */}
        <section className="home_hero">

          <h1 className="home_title">
            Hola, Laura!
          </h1>

          <p className="home_subtitle">
            ¿Has perdido algo hoy o
            encontraste un tesoro ajeno?
          </p>

        </section>

        {/* Botones principales */}
        <section className="home_actions">

          <ActionCard
            title="Perdí Algo"
            subtitle="Iniciar Búsqueda"
            background_color="#FF6F00"
            show_icon={true}
          />

          <ActionCard
            title="Encontré Algo"
            subtitle="Publicar hallazgo"
            background_color="#FFC107"
          />

        </section>

        {/* Logos instituciones */}
        <InstitutionLogos
          institutions={institutions}
        />

        {/* Objetos recientes */}
        <section className="recent_section">

          <h2 className="recent_title">
            Objetos Recientes
          </h2>

          <RecentObjectsCarousel
            objects={recent_objects}
          />

        </section>

      </main>


    </div>
  );
};

export default HomePage;