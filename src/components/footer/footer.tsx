import "./footer.css";

import {
  House,
  Search,
  CirclePlus,
  UserRound,
} from "lucide-react";

const Footer = () => {

  return (
    <footer className="footer">

      {/* Botón inicio */}
      {/* Más adelante navegará al home */}
      <button className="footer_item">

        <House
          size={30}
          strokeWidth={2.2}
        />

        <span className="footer_text">
          INICIO
        </span>

      </button>

      {/* Botón buscar */}
      {/* Más adelante navegará al buscador */}
      <button className="footer_item">

        <Search
          size={30}
          strokeWidth={2.2}
        />

        <span className="footer_text">
          BUSCAR
        </span>

      </button>

      {/* Botón publicar */}
      {/* Más adelante abrirá crear publicación */}
      <button className="footer_item">

        <CirclePlus
          size={30}
          strokeWidth={2.2}
        />

        <span className="footer_text">
          PUBLICAR
        </span>

      </button>

      {/* Botón perfil */}
      {/* Más adelante navegará al perfil */}
      <button className="footer_item">

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