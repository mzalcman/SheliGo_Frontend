import "./header.css";

import {
  Bell,
  MessageCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/use_auth";

const Header = () => {

  // Obtenemos el usuario global.
  // Más adelante vendrá automáticamente desde Supabase.
  const { user } = useAuth();

  return (
    <header className="header">

      {/* Imagen del usuario */}
      {/* Más adelante va a navegar al menu hamburguesa */}
      <button className="header_profile_button">

        <img
          src={user?.profile_image}
          alt="user profile"
          className="header_profile_image"
        />

      </button>

      {/* Contenedor de iconos */}
      <div className="header_icons">

        {/* Chat */}
        {/* Más adelante navegará al chat */}
        <button className="header_icon_button">

          <MessageCircle
            size={34}
            strokeWidth={2.2}
          />

        </button>

        {/* Notificaciones */}
        {/* Más adelante navegará a notifications */}
        <button className="header_icon_button">

          <Bell
            size={34}
            strokeWidth={2.2}
          />

        </button>

      </div>

    </header>
  );
};

export default Header;