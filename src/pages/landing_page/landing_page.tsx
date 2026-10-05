import "./landing_page.css";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, MessageCircle, PackageCheck } from "lucide-react";
import BrandLogo from "../../components/brand_logo/brand_logo";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main className="landing_page">
      <div className="landing_image_container" />

      <section className="landing_content">
        <h1 className="landing_logo">
          <BrandLogo size="lg" />
        </h1>

        <h2 className="landing_title">
          Lo que perdiste
          <span>puede volver.</span>
        </h2>

        <p className="landing_subtitle">
          Reportá, buscá y recuperá en tu institución.
        </p>

        <ul className="landing_steps">
          <li><Search size={16} strokeWidth={2.2} /> Reportá</li>
          <li><MessageCircle size={16} strokeWidth={2.2} /> Coordiná</li>
          <li><PackageCheck size={16} strokeWidth={2.2} /> Recuperá</li>
        </ul>

        <div className="landing_buttons">
          <button
            className="btn btn_primary btn_lg btn_block"
            onClick={() => navigate("/register")}
          >
            Registrarse
            <ArrowRight size={18} strokeWidth={2.4} />
          </button>
          <button
            className="btn btn_ghost btn_lg btn_block"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>

        <p className="landing_tagline">Porque lo tuyo vuelve.</p>
      </section>
    </main>
  );
};

export default LandingPage;
