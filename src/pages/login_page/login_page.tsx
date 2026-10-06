import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/auth_service";
import Loader from "../../components/loader/loader";
import { useAuth } from "../../hooks/use_auth";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Modal from "../../components/modal/modal";
import { api } from "../../services/api";
import BrandLogo from "../../components/brand_logo/brand_logo";
import "../../styles/auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext, loginWithGoogle, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // DETECTA SI LA SESIÓN EXPIRÓ (Y limpia el query param inmediatamente para no propagarlo)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("expired") === "true") {
      setShowExpiredModal(true);
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (user) {
      const redirectUrl = localStorage.getItem("redirect_after_login");
      if (redirectUrl) {
        localStorage.removeItem("redirect_after_login");
        navigate(redirectUrl, { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate]);

  const is_valid_email = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handle_login = async () => {
    setError("");

    if (!is_valid_email(email)) {
      setError("Ingresa un correo válido.");
      return;
    }

    try {
      setLoading(true);
      const resData = await login(email, password);
    
      // Extracción robusta de token y usuario sin importar cómo responda el backend
      const token = resData?.token || resData?.data?.token;
      const usuario = resData?.usuario || resData?.data?.usuario || resData;

      if (!token || !usuario) {
        throw new Error("Respuesta inválida del servidor");
      }

      // 1. Configurar axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);

      // 2. Guardar en contexto
      loginContext(usuario);

      // 3. Navegar
      const redirectUrl = localStorage.getItem("redirect_after_login");
      if (redirectUrl) {
        localStorage.removeItem("redirect_after_login");
        navigate(redirectUrl, { replace: true });
      } else {
        navigate("/home", { replace: true });
      }

    } catch (error: any) {
      console.error(error);
      setLoading(false);
      setError("Correo o contraseña incorrectos.");
    }
  };

  const handleCloseExpiredModal = () => {
    setShowExpiredModal(false);
  };

  const handleGoToRegister = () => {
    setShowExpiredModal(false);
    navigate("/register", { replace: true });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="auth_page">
      <aside className="auth_brand_panel">
        <BrandLogo size="md" tone="light" />
        <div className="auth_brand_copy">
          <h2>Porque lo tuyo vuelve.</h2>
          <p>La plataforma para recuperar objetos perdidos dentro de tu institución.</p>
        </div>
        <img src="/logo_sheligo.png" alt="" className="auth_brand_mark" />
      </aside>

      <div className="auth_main">
        <div className="auth_content">
          <header className="auth_header">
            <BrandLogo size="md" />
            <p className="auth_subtitle">
              Encuentra lo que perdiste, devuelve lo que encontraste.
            </p>
          </header>

          <div className="auth_card">
            <h1 className="auth_title">Iniciar Sesión</h1>

            <div className="form_field">
              <label className="form_label">Correo electrónico</label>
              <div className="auth_input_icon">
                <Mail size={18} />
                <input
                  type="email"
                  className="form_input"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="form_field">
              <label className="form_label">Contraseña</label>
              <div className="password_input_container auth_input_icon">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form_input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <button
                  type="button"
                  className="password_toggle"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="form_alert form_alert_error">{error}</p>}

            <button className="btn btn_primary btn_lg btn_block" onClick={handle_login}>
              Entrar
            </button>

            <div className="auth_divider">
              <span>o también puedes</span>
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="btn btn_ghost btn_lg btn_block google_pill_button"
            >
              <img
                src="https://www.vectorlogo.zone/logos/google/google-icon.svg"
                alt="Google"
              />
              Sign in with Google
            </button>
          </div>

          <div className="auth_switch">
            <span>¿No tienes una cuenta?</span>
            <button
              className="btn_text"
              onClick={handleGoToRegister}
            >
              Regístrate gratis
            </button>
          </div>
        </div>
      </div>

      {/* Modal de sesión expirada */}
      <Modal
        isOpen={showExpiredModal}
        onClose={handleCloseExpiredModal}
        title="Sesión Expirada"
        description="Tu sesión ha caducado por inactividad o seguridad. Por favor, vuelve a iniciar sesión para continuar."
        variant="default"
        icon={<Lock size={26} strokeWidth={2.2} />}
        confirmText="Entendido"
        onConfirm={handleCloseExpiredModal}
      />
    </main>
  );
};

export default LoginPage;