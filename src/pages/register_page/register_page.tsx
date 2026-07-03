import "./register_page.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react"; // 🔴 Importamos CheckCircle para el tic
import ImageUploader from "../../components/image_uploader/image_uploader";
import Loader from "../../components/loader/loader";
import { register } from "../../services/auth_service";
import { useAuth } from "../../hooks/use_auth";

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
    <main className="register_page">
      <div className="register_top" />
      <div className="register_content">
        <h1 className="register_logo">SheliGo</h1>

        <p className="register_subtitle">
          Crea tu cuenta para comenzar a encontrar y devolver objetos.
        </p>

        <div className="register_card">
          <h2>Crear Cuenta</h2>

          <ImageUploader images={images} setImages={setImages} maxFiles={1}/>

          <label>Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label>Apellido</label>
          <input
            type="text"
            placeholder="Apellido"
            value={lastname}
            onChange={(event) => setLastname(event.target.value)}
          />

          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Teléfono</label>
          <input
            type="text"
            placeholder="11 1234-5678"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={13}
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

          <label>Confirmar contraseña</label>
          <div className="password_input_container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button
              type="button"
              className="password_toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {error && <p className="register_error">{error}</p>}

          <button className="register_button" onClick={handleRegister}>
            Registrarme
          </button>

          <div style={{ margin: "15px 0", textAlign: "center", color: "#888", fontSize: "14px" }}>
            <span>o regístrate con tu cuenta</span>
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
          <span>¿Ya tienes una cuenta?</span>
          <button
            className="register_link"
            onClick={() => navigate("/login")}
          >
            Inicia sesión
          </button>
        </div>
      </div>

      {/* 🔴 MODAL DE CONFIRMACIÓN DE REGISTRO EXITOSO */}
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