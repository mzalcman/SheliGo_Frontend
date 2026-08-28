import "./login_page.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/auth_service";
import Loader from "../../components/loader/loader";
import { useAuth } from "../../hooks/use_auth";
import { Eye, EyeOff, Lock } from "lucide-react";
import Modal from "../../components/modal/modal";

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
      const response = await login(email, password);

      const token = response?.token || response?.data?.token;
      const usuario = response?.usuario || response?.data?.usuario;

      if (!token || !usuario) {
        throw new Error("Respuesta inválida del servidor");
      }

      localStorage.setItem("token", token);
      loginContext(usuario);

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
    <main className="login_page">
      <div className="login_top" />
      <div className="login_content">
        <h1 className="login_logo">SheliGo</h1>
        <p className="login_subtitle">
          Encuentra lo que perdiste, devuelve lo que encontraste.
        </p>

        <div className="login_card">
          <h2>Iniciar Sesión</h2>

          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Contraseña</label>
          <div className="password_input_container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="button"
              className="password_toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {error && <p className="login_error">{error}</p>}

          <button className="login_button" onClick={handle_login}>
            Entrar
          </button>

          <div style={{ margin: "3px 0", textAlign: "center", color: "#888", fontSize: "14px" }}>
            <span>o también puedes</span>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="google_pill_button"
          >
            <img
              src="https://www.vectorlogo.zone/logos/google/google-icon.svg"
              alt="Google"
            />
            Sign in with Google
          </button>
        </div>

        <div className="register_container">
          <span>¿No tienes una cuenta?</span>
          <button
            className="register_link"
            onClick={handleGoToRegister}
          >
            Regístrate gratis
          </button>
        </div>
      </div>

      {/* MODAL DE SESIÓN EXPIRADA */}
      <Modal
        isOpen={showExpiredModal}
        onClose={handleCloseExpiredModal}
        title="Sesión Expirada"
        description="Tu sesión ha caducado por inactividad o seguridad. Por favor, vuelve a iniciar sesión para continuar."
        variant="error"
        icon={<Lock size={36} color="#FF6F00" />}
        confirmText="Entendido"
        onConfirm={handleCloseExpiredModal}
      />
    </main>
  );
};

export default LoginPage;