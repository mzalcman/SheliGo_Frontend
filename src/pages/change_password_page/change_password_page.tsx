import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Modal from "../../components/modal/modal"; // Ajusta la ruta a tu modal si es diferente
import "./change_password_page.css";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
    icon: React.ReactNode;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "success",
    icon: null,
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showModalError = (title: string, description: string) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      variant: "error",
      icon: <AlertCircle size={36} color="#d32f2f" />,
      onConfirm: closeModal,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showModalError("Campos incompletos", "Por favor, completa todos los campos del formulario.");
      return;
    }

    if (newPassword.length < 6) {
      showModalError("Contraseña muy corta", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showModalError("Las contraseñas no coinciden", "Revisa que la nueva contraseña y su confirmación sean idénticas.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/usuarios/cambiar-contrasena", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contrasenaActual: currentPassword,
          nuevaContrasena: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalConfig({
          isOpen: true,
          title: "¡Contraseña actualizada!",
          description: "Tu contraseña ha sido cambiada exitosamente.",
          variant: "success",
          icon: <CheckCircle2 size={36} color="#2e7d32" />,
          onConfirm: () => {
            closeModal();
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigate("/perfil");
          },
        });
      } else {
        showModalError(
          "No se pudo cambiar",
          data?.message || "Ocurrió un problema al cambiar la contraseña. Revisa tus datos."
        );
      }
    } catch (err) {
      console.error("Error cambiando contraseña:", err);
      showModalError("Error de conexión", "No fue posible conectar con el servidor. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change_pw_layout">
      <Header />

      <main className="change_pw_container">
        <div className="change_pw_nav">
          <button className="change_pw_back_btn" onClick={() => navigate(-1)} type="button">
            <ArrowLeft size={26} color="#ff6f00" strokeWidth={2.5} />
          </button>
          <h1 className="change_pw_title">Cambiar Contraseña</h1>
        </div>

        <p className="change_pw_subtitle">
          Crea una nueva contraseña segura para proteger tu cuenta de SheliGo.
        </p>

        <form onSubmit={handleSubmit} className="change_pw_form">
          {/* Contraseña Actual */}
          <div className="change_pw_field">
            <label>Contraseña Actual</label>
            <div className="change_pw_input_wrapper">
              <Key size={18} className="field_icon" />
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle_pwd_btn"
                onClick={() => setShowCurrent(!showCurrent)}
                disabled={loading}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="change_pw_field">
            <label>Nueva Contraseña</label>
            <div className="change_pw_input_wrapper">
              <Key size={18} className="field_icon" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle_pwd_btn"
                onClick={() => setShowNew(!showNew)}
                disabled={loading}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div className="change_pw_field">
            <label>Confirmar Nueva Contraseña</label>
            <div className="change_pw_input_wrapper">
              <Key size={18} className="field_icon" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle_pwd_btn"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={loading}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="change_pw_submit_btn"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </main>

      <Footer />

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        icon={modalConfig.icon}
        confirmText="Aceptar"
        onConfirm={modalConfig.onConfirm || closeModal}
      />
    </div>
  );
};

export default ChangePasswordPage;