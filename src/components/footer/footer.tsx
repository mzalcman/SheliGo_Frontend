import "./footer.css";
import { House, Search, Plus, UserRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Solo visual: marca el ítem de la sección actual
  const is_active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <footer className="footer">
      <nav className="footer_nav" aria-label="Navegación principal">
        <button
          className={`footer_item ${is_active("/home") ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          <House size={22} strokeWidth={2} />
          <span className="footer_text">Inicio</span>
        </button>

        <button
          className={`footer_item ${is_active("/buscar") ? "active" : ""}`}
          onClick={() => navigate("/buscar")}
        >
          <Search size={22} strokeWidth={2} />
          <span className="footer_text">Buscar</span>
        </button>

        <button
          className={`footer_item footer_item_publish ${is_active("/publicar") ? "active" : ""}`}
          onClick={() => navigate("/publicar")}
        >
          <span className="footer_publish_icon">
            <Plus size={22} strokeWidth={2.4} />
          </span>
          <span className="footer_text">Publicar</span>
        </button>

        <button
          className={`footer_item ${is_active("/perfil") ? "active" : ""}`}
          onClick={() => navigate("/perfil")}
        >
          <UserRound size={22} strokeWidth={2} />
          <span className="footer_text">Perfil</span>
        </button>
      </nav>
    </footer>
  );
};

export default Footer;
