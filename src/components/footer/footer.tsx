import "./footer.css";
import { House, Search, CirclePlus, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="footer">
      <button className="footer_item" onClick={() => navigate("/home")}>
        <House
          size={30}
          strokeWidth={2.2}
        />
        <span className="footer_text">
          INICIO
        </span>
      </button>

      <button className="footer_item" onClick={() => navigate("/buscar")}>
        <Search
          size={30}
          strokeWidth={2.2}
        />
        <span className="footer_text">
          BUSCAR
        </span>
      </button>

      <button
        className="footer_item"
        onClick={() => navigate("/publicar")}
      >
        <CirclePlus
          size={30}
          strokeWidth={2.2}
        />
        <span className="footer_text">
          PUBLICAR
        </span>
      </button>

      {/* 🚀 Botón Perfil: Ahora tiene el onClick que te redirige a tu pantalla de perfil */}
      <button className="footer_item" onClick={() => navigate("/perfil")}>
        <UserRound
          size={30}
          strokeWidth={2.2}
        />
        <span className="footer_text">
          PERFIL
        </span>
      </button>
    </footer>
  );
};

export default Footer;