import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Modal from "../../components/modal/modal";
import { api } from "../../services/api";
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
      icon: <AlertCircle size={28} strokeWidth={2.2} />,
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
      // La instancia "api" agrega el token Bearer automáticamente
      await api.put("/usuarios/cambiar-contrasena", {
        contrasenaActual: currentPassword,
        nuevaContrasena: newPassword,
      });

      setModalConfig({
        isOpen: true,
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente.",
        variant: "success",
        icon: <CheckCircle2 size={28} strokeWidth={2.2} />,
        onConfirm: () => {
          closeModal();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          navigate("/perfil");
        },
      });
    } catch (err: any) {
      console.error("Error cambiando contraseña:", err);
      const errorMessage =
        err.response?.data?.message ||
        "No fue posible conectar con el servidor. Inténtalo más tarde.";
      
      showModalError("No se pudo cambiar", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change_pw_layout">
      <Header />

      <main className="page_container narrow">
        <div className="page_topbar">
          <button className="icon_button" onClick={() => navigate(-1)} type="button" aria-label="Volver">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h1 className="page_title">Cambiar Contraseña</h1>
        </div>

        <div className="change_pw_card">
          <div className="change_pw_intro">
            <span className="change_pw_icon">
              <ShieldCheck size={22} strokeWidth={2.2} />
            </span>
            <p className="page_subtitle">
              Crea una nueva contraseña segura para proteger tu cuenta de SheliGo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="change_pw_form">
            <div className="form_field">
              <label className="form_label">Contraseña Actual</label>
              <div className="change_pw_input_wrapper password_input_container">
                <Key size={18} className="field_icon" />
                <input
                  type={showCurrent ? "text" : "password"}
                  className="form_input"
                  placeholder="Ingresa tu contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password_toggle"
                  aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowCurrent(!showCurrent)}
                  disabled={loading}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form_field">
              <label className="form_label">Nueva Contraseña</label>
              <div className="change_pw_input_wrapper password_input_container">
                <Key size={18} className="field_icon" />
                <input
                  type={showNew ? "text" : "password"}
                  className="form_input"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password_toggle"
                  aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowNew(!showNew)}
                  disabled={loading}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form_field">
              <label className="form_label">Confirmar Nueva Contraseña</label>
              <div className="change_pw_input_wrapper password_input_container">
                <Key size={18} className="field_icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  className="form_input"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password_toggle"
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={loading}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn_primary btn_lg btn_block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Guardando...</span>
                  <div className="spinner_small"></div>
                </>
              ) : "Actualizar Contraseña"}
            </button>
          </form>
        </div>
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