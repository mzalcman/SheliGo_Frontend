import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, X, Building2 } from "lucide-react";
import ImageUploader from "../../components/image_uploader/image_uploader";
import Loader from "../../components/loader/loader";
import { register } from "../../services/auth_service";
import { get_all_institutions } from "../../services/home_service";
import { useAuth } from "../../hooks/use_auth";
import BrandLogo from "../../components/brand_logo/brand_logo";
import "../../styles/auth.css";
import "../../styles/institution_picker.css";
import "../../components/modal/modal.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [availableInstitutions, setAvailableInstitutions] = useState<any[]>([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<any[]>([]);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await get_all_institutions();
        // El backend responde { status: 'success', data: { instituciones: [...] } }
        const instList = response?.data?.instituciones || [];
        setAvailableInstitutions(instList);
      } catch (err) {
        console.error("Error al obtener instituciones:", err);
        setAvailableInstitutions([]);
      }
    };

    fetchInstitutions();
  }, []);

  const is_valid_email = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(event.target.value));
  };

  const handleInstitutionQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInstitutionQuery(value);

    if (value.trim().length > 0) {
      const cleanQuery = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const filtered = availableInstitutions.filter((inst) => {
        const rawName = typeof inst === "string" ? inst : inst.nombre || inst.name || "";
        const cleanName = rawName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const instId = typeof inst === "string" ? inst : inst.id || inst.institucion_id;
        const alreadySelected = selectedInstitutions.some(
          (selected) => (typeof selected === "string" ? selected : selected.id || selected.institucion_id) === instId
        );

        return cleanName.includes(cleanQuery) && !alreadySelected;
      });

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectInstitution = (inst: any) => {
    setSelectedInstitutions([...selectedInstitutions, inst]);
    setInstitutionQuery("");
    setSuggestions([]);
  };

  const handleRemoveInstitution = (instToRemove: any) => {
    const targetId = instToRemove.id || instToRemove.institucion_id || instToRemove;
    setSelectedInstitutions(
      selectedInstitutions.filter(
        (inst) => (inst.id || inst.institucion_id || inst) !== targetId
      )
    );
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
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

      // 1. Extraer los IDs reales de cada institución
      const instIds = selectedInstitutions
        .map((inst) => (typeof inst === "object" ? inst.id || inst.institucion_id : inst))
        .filter(Boolean);

      // 2. Enviar con el nombre 'instituciones_ids' que espera el servicio del backend
      if (instIds.length > 0) {
        instIds.forEach((id) => {
          formData.append("instituciones_ids", String(id));
        });
      }

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

  const handleGoogleClick = async () => {
    try {
      setError("");
      setLoading(true);

      // Ejecuta la función de tu context
      const res: any = await loginWithGoogle();

      // Si la API devuelve que debe completar perfil
      if (res?.data?.requiereCompletarPerfil || res?.requiereCompletarPerfil) {
        navigate("/completar-perfil");
      } else {
        navigate("/home");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Ocurrió un error al iniciar sesión con Google."
      );
    } finally {
      setLoading(false);
    }
  };

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

            <ImageUploader images={images} setImages={setImages} maxFiles={1} />

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

            {/* Instituciones asociadas */}
            <div className="form_field">
              <label className="form_label">Instituciones asociadas</label>

              {selectedInstitutions.length > 0 && (
                <div className="institutions_chips_container">
                  {selectedInstitutions.map((inst) => {
                    const labelName = typeof inst === "string" ? inst : inst.nombre || inst.name;
                    const instId = inst.id || inst.institucion_id || inst;
                    return (
                      <div className="institution_chip" key={instId}>
                        <span>{labelName}</span>
                        <button
                          type="button"
                          aria-label={`Quitar ${labelName}`}
                          onClick={() => handleRemoveInstitution(inst)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="institution_input_wrapper auth_input_icon">
                <Building2 size={18} />
                <input
                  type="text"
                  className="form_input"
                  placeholder="Escribe y selecciona tu institución..."
                  value={institutionQuery}
                  onChange={handleInstitutionQueryChange}
                />
                {suggestions.length > 0 && (
                  <ul className="institution_dropdown">
                    {suggestions.map((item) => {
                      const labelName = typeof item === "string" ? item : item.nombre || item.name;
                      const itemId = item.id || item.institucion_id || item;
                      return (
                        <li key={itemId} onClick={() => handleSelectInstitution(item)}>
                          {labelName}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
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
              onClick={handleGoogleClick}
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