import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validaciones locales
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Las nuevas contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Ajustá la URL si tu endpoint se llama distinto en el backend
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
        setSuccessMsg("¡Contraseña actualizada con éxito!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/perfil");
        }, 1800);
      } else {
        setErrorMsg(data?.message || "No se pudo cambiar la contraseña. Revisa tus datos.");
      }
    } catch (err) {
      console.error("Error cambiando contraseña:", err);
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change_pw_layout">
      <Header />

      <main className="page_container narrow">
        <div className="page_topbar">
          <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
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

          {/* Mensajes de Alerta */}
          {errorMsg && (
            <div className="form_alert form_alert_error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="form_alert form_alert_success">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario */}
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
              />
              <button
                type="button"
                className="password_toggle"
                aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowCurrent(!showCurrent)}
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
              />
              <button
                type="button"
                className="password_toggle"
                aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowNew(!showNew)}
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
              />
              <button
                type="button"
                className="password_toggle"
                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

            {/* Botón de envío */}
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
    </div>
  );
};

export default ChangePasswordPage;