import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import ImageUploader from "../../components/image_uploader/image_uploader";
import Loader from "../../components/loader/loader";
import { register } from "../../services/auth_service";
import { useAuth } from "../../hooks/use_auth";
import BrandLogo from "../../components/brand_logo/brand_logo";
import "../../styles/auth.css";
import "../../components/modal/modal.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const is_valid_email = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return numbers;
    }
    if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    }
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(event.target.value));
  };

  const handleRegister = async () => {
    setError("");
    if (!name || !lastname || !email || !password || !confirmPassword) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (!is_valid_email(email)) {
      setError("Ingresa un correo válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const capitalizeWords = (str: string) => {
      return str
        .trim() 
        .toLowerCase() 
        .split(/\s+/) 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
        .join(" ");
    };

    try {
      const formData = new FormData();
      
      formData.append("nombre", capitalizeWords(name));
      formData.append("apellido", capitalizeWords(lastname));
      
      formData.append("email", email);
      formData.append("telefono", phone.replace(/\D/g, ""));
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      
      if (images.length > 0) {
        formData.append("foto", images[0]);
      }

      await register(formData);
      
      setLoading(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error: any) {
      setLoading(false);
      setError(
        error.response?.data?.message || "Ocurrió un error al registrarte."
      );
    }
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
          <p>Sumate a la comunidad que ayuda a que cada objeto encuentre su camino de regreso.</p>
        </div>
        <img src="/logo_sheligo.png" alt="" className="auth_brand_mark" />
      </aside>

      <div className="auth_main">
        <div className="auth_content">
          <header className="auth_header">
            <BrandLogo size="md" />
            <p className="auth_subtitle">
              Crea tu cuenta para comenzar a encontrar y devolver objetos.
            </p>
          </header>

          <div className="auth_card">
            <h1 className="auth_title">Crear Cuenta</h1>

            <ImageUploader images={images} setImages={setImages} maxFiles={1}/>

            <div className="auth_grid">
              <div className="form_field">
                <label className="form_label">Nombre</label>
                <input
                  type="text"
                  className="form_input"
                  placeholder="Nombre"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="form_field">
                <label className="form_label">Apellido</label>
                <input
                  type="text"
                  className="form_input"
                  placeholder="Apellido"
                  value={lastname}
                  onChange={(event) => setLastname(event.target.value)}
                />
              </div>
            </div>

            <div className="form_field">
              <label className="form_label">Correo electrónico</label>
              <input
                type="email"
                className="form_input"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form_field">
              <label className="form_label">Teléfono</label>
              <input
                type="text"
                className="form_input"
                placeholder="11 1234-5678"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={13}
              />
            </div>

            <div className="form_field">
              <label className="form_label">Contraseña</label>
              <div className="password_input_container">
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

            <div className="form_field">
              <label className="form_label">Confirmar contraseña</label>
              <div className="password_input_container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form_input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password_toggle"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="form_alert form_alert_error">{error}</p>}

            <button className="btn btn_primary btn_lg btn_block" onClick={handleRegister}>
              Registrarme
            </button>

            <div className="auth_divider">
              <span>o regístrate con tu cuenta</span>
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
            <span>¿Ya tienes una cuenta?</span>
            <button
              className="btn_text"
              onClick={() => navigate("/login")}
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de registro exitoso */}
      {showSuccessModal && (
        <div className="success_modal_overlay">
          <div className="success_modal_card">
            <CheckCircle size={48} className="success_modal_icon" />
            <h3>¡Registro Exitoso!</h3>
            <p>Tu cuenta ha sido creada correctamente. Redirigiéndote al inicio de sesión...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default RegisterPage;