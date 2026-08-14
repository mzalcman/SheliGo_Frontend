import "./PrivacySecurityPage.css"
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  ShieldAlert, 
  UserCheck, 
  Camera, 
  GraduationCap, 
  ArrowRight 
} from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const PrivacySecurityPage = () => {
  const navigate = useNavigate();

  return (
    <main className="privacy_page">
      <Header />

      <div className="privacy_content">
        <header className="privacy_title_header">
          <button className="back_button" onClick={() => navigate(-1)}>
            <ArrowLeft size={28} color="#ff6f00" />
          </button>
          <h1>Privacidad y seguridad</h1>
        </header>

        <section className="privacy_hero">
          <div className="privacy_hero_icon">
            <ShieldCheck size={36} color="#ff6f00" />
          </div>
          <h2>Tu seguridad es importante</h2>
          <p>
            En SheliGo trabajamos para proteger tu cuenta y mantener segura tu
            información personal, garantizando un entorno de confianza.
          </p>
        </section>

        <div className="privacy_cards_list">
          {/* Card 1 */}
          <div className="privacy_card">
            <div className="card_icon_circle">
              <Lock size={22} color="#ff6f00" />
            </div>
            <div className="card_text_content">
              <h3>Protección de tu cuenta</h3>
              <p>
                El acceso a tu cuenta está protegido mediante mecanismos de
                autenticación robustos para evitar accesos no autorizados en
                todo momento.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="privacy_card">
            <div className="card_icon_circle">
              <ShieldAlert size={22} color="#ff6f00" />
            </div>
            <div className="card_text_content">
              <h3>Protección de tus datos</h3>
              <p>
                Trabajamos incansablemente para mantener tus datos personales
                protegidos y utilizarlos únicamente para el correcto
                funcionamiento de SheliGo.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="privacy_card">
            <div className="card_icon_circle">
              <UserCheck size={22} color="#ff6f00" />
            </div>
            <div className="card_text_content">
              <h3>Tu información personal</h3>
              <p>
                No mostramos públicamente información sensible de tu cuenta. Solo
                utilizamos la información estrictamente necesaria para que puedas
                gestionar tus publicaciones y recuperar objetos.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="privacy_card">
            <div className="card_icon_circle">
              <Camera size={22} color="#ff6f00" />
            </div>
            <div className="card_text_content">
              <h3>Tus publicaciones</h3>
              <p>
                Las fotos y datos descriptivos que compartís se utilizan
                exclusivamente para facilitar la rápida identificación y
                recuperación de objetos perdidos en la comunidad.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="privacy_card">
            <div className="card_icon_circle">
              <GraduationCap size={22} color="#ff6f00" />
            </div>
            <div className="card_text_content">
              <h3>Entorno institucional</h3>
              <p>
                Las publicaciones pueden estar vinculadas a instituciones
                educativas o corporativas para facilitar la recuperación de objetos
                dentro de un entorno seguro y organizado.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque de Ayuda / Soporte al final */}
        <section className="privacy_help_card">
          <h3>¿Necesitás ayuda?</h3>
          <p>
            Si tenés dudas sobre la privacidad o seguridad de tu cuenta, podés
            comunicarte con nuestro equipo de soporte dedicado.
          </p>
          <button
            className="contact_sheligo_button"
            onClick={() => navigate("/contactanos")}
          >
            <span>Contactar con SheliGo</span>
            <ArrowRight size={20} />
          </button>
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default PrivacySecurityPage;