import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";
import "./logout_button.css";
import Modal from "../../components/modal/modal";

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

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="¿Deseas cerrar sesión?"
        description="Tendrás que volver a ingresar tus credenciales para acceder a SheliGo."
        variant="confirm"
        icon={<LogOut size={24} color="#8D4F2A" strokeWidth={2.5} />}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default LogoutButton;