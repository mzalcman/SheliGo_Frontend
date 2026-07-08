import "./menu_page.css";
import { User, Package, Wallet, Headphones, LogOut, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use_auth";
import { getImageUrl } from "../../utils/get_image_url";

const MenuPage = () => {
  const { user: typedUser, logout } = useAuth();
  const navigate = useNavigate();

  const user = typedUser as any;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
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

          <h2 className="menu_name">{userFullName}</h2>

          <button className="menu_view_profile">Ver perfil</button>
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

          <button
            className="menu_option"
            onClick={() => navigate("/ayuda")}
          >
            <Headphones size={20} />
            <span>Ayuda</span>
          </button>
        </div>

        <button className="menu_logout" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>

      </div>

      {showLogoutModal && (
        <div className="delete_modal_overlay">
          <div className="delete_modal_card">
            <div className="logout_modal_icon_container">
              <LogOut size={24} color="#8D4F2A" strokeWidth={2.5} />
            </div>

            <h2>¿Deseas cerrar sesión?</h2>
            <p>Tendrás que volver a ingresar tus credenciales para acceder a SheliGo.</p>

            <button className="modal_confirm_button" onClick={handleLogoutConfirm}>
              Confirmar
            </button>
            <button className="modal_cancel_button" onClick={() => setShowLogoutModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MenuPage;