import "./PrivacySecurityPage.css";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  ShieldAlert,
  UserCheck,
  Camera,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const PRIVACY_ITEMS = [
  {
    icon: Lock,
    title: "Protección de tu cuenta",
    text: "El acceso a tu cuenta está protegido mediante mecanismos de autenticación robustos para evitar accesos no autorizados en todo momento.",
  },
  {
    icon: ShieldAlert,
    title: "Protección de tus datos",
    text: "Trabajamos incansablemente para mantener tus datos personales protegidos y utilizarlos únicamente para el correcto funcionamiento de SheliGo.",
  },
  {
    icon: UserCheck,
    title: "Tu información personal",
    text: "No mostramos públicamente información sensible de tu cuenta. Solo utilizamos la información estrictamente necesaria para que puedas gestionar tus publicaciones y recuperar objetos.",
  },
  {
    icon: Camera,
    title: "Tus publicaciones",
    text: "Las fotos y datos descriptivos que compartís se utilizan exclusivamente para facilitar la rápida identificación y recuperación de objetos perdidos en la comunidad.",
  },
  {
    icon: GraduationCap,
    title: "Entorno institucional",
    text: "Las publicaciones pueden estar vinculadas a instituciones educativas o corporativas para facilitar la recuperación de objetos dentro de un entorno seguro y organizado.",
  },
];

const PrivacySecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy_page">
      <Header />

      <main className="page_container narrow">
        <div className="page_topbar">
          <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h1 className="page_title">Privacidad y seguridad</h1>
        </div>

        <section className="privacy_hero">
          <div className="privacy_hero_icon">
            <ShieldCheck size={30} strokeWidth={2.2} />
          </div>
          <h2>Tu seguridad es importante</h2>
          <p>
            En SheliGo trabajamos para proteger tu cuenta y mantener segura tu
            información personal, garantizando un entorno de confianza.
          </p>
        </section>

        <div className="privacy_cards_list">
          {PRIVACY_ITEMS.map(({ icon: Icon, title, text }) => (
            <div className="privacy_card" key={title}>
              <div className="privacy_card_icon">
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <div className="privacy_card_text">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="privacy_help_card">
          <div>
            <h3>¿Necesitás ayuda?</h3>
            <p>
              Si tenés dudas sobre la privacidad o seguridad de tu cuenta, podés
              comunicarte con nuestro equipo de soporte dedicado.
            </p>
          </div>
          <button
            className="btn btn_secondary"
            onClick={() => navigate("/contactanos")}
          >
            <span>Contactar con SheliGo</span>
            <ArrowRight size={18} strokeWidth={2.2} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacySecurityPage;
