import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/use_auth"; // Ajustá la ruta si es necesario
import "./logout_button.css";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      <button className="menu_logout" onClick={() => setShowLogoutModal(true)}>
        <LogOut size={20} />
        <span>Cerrar sesión</span>
      </button>

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
    </>
  );
};

export default LogoutButton;