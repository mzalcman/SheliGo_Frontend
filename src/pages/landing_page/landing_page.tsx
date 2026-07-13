import "./landing_page.css";
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
const navigate = useNavigate();

  return (

    <main className="landing_page">

      <div className="landing_image_container" />

      <section className="landing_content">

        <h1 className="landing_logo">
          SheliGo
        </h1>

        <h2 className="landing_title">
          Lo que perdiste
          <span>puede volver.</span>
        </h2>

        <p className="landing_subtitle">
          Reportá, buscá y recuperá en tu institución.
        </p>

        <div className="landing_buttons">

          <button className="landing_register_button" 
          onClick={() =>
              navigate("/register")
            }>
            Registrarse
          </button> 
          <button
            className="landing_login_button"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>

        </div>

      </section>

    </main>

  );

};

export default LandingPage;