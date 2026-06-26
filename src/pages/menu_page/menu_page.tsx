import "./menu_page.css";
import {
  User,
  Package,
  Wallet,
  Headphones,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use_auth";
import { getImageUrl } from "../../utils/get_image_url";

const MenuPage = () => {
  const { user: typedUser, logout } = useAuth();
  const navigate = useNavigate();

  const user = typedUser as any;

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  const userFullName = user?.name || "Usuario";

  return (
    <main className="menu_page">
      <div className="menu_container">

        <button className="menu_back_button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
          <span style={{ marginLeft: "8px" }}>Menu</span>
        </button>

        <div className="menu_profile">
          <div className="menu_profile_image_container">
            {/* Renderiza la foto real de Yanina */}
            <img
              src={
                user?.profile_image
                  ? getImageUrl(user.profile_image)
                  : "/default-user.png"
              }
              alt={userFullName}
              className="menu_profile_image"
            />
            <div className="menu_online_dot" />
          </div>

          {/* Renderiza el nombre real de Yanina */}
          <h2 className="menu_name">
            {userFullName}
          </h2>

          <button className="menu_view_profile">
            Ver perfil
          </button>
        </div>

        <div className="menu_options">
          <button className="menu_option menu_option_active">
            <User size={20} />
            <span>Información personal</span>
          </button>

          <button className="menu_option">
            <Package size={20} />
            <span>Mis publicaciones</span>
          </button>

          <button className="menu_option">
            <Wallet size={20} />
            <span>Movimientos</span>
          </button>

          <button className="menu_option">
            <Headphones size={20} />
            <span>Ayuda</span>
          </button>
        </div>

        <button className="menu_logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>

      </div>
    </main>
  );
};

export default MenuPage;