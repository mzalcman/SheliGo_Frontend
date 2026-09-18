import "./register_page.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import ImageUploader from "../../components/image_uploader/image_uploader";
import Loader from "../../components/loader/loader";
import { register } from "../../services/auth_service";
import { useAuth } from "../../hooks/use_auth";

// Interfaz que define los campos del formulario administrados por React Hook Form
export interface RegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  terminos: boolean;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();

  const [images, setImages] = useState<File[]>([]);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicialización de React Hook Form
  const {
    register: registerField,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    mode: "onTouched",
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      confirmPassword: "",
      terminos: false,
    },
  });

  // Suscripción al valor de password para la validación cruzada con confirmPassword
  const passwordValue = watch("password");

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  // Limpieza del temporizador y reinicio del formulario al desmontar
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      reset(); // Punto 8: Limpieza del formulario y reseteo de estados/errores
    };
  }, [reset]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  };

  const capitalizeWords = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Función ejecutada únicamente cuando el formulario supera todas las validaciones de RHF
  const onSubmit = async (data: RegisterFormValues) => {
    setServerError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", capitalizeWords(data.nombre));
      formData.append("apellido", capitalizeWords(data.apellido));
      formData.append("email", data.email);
      formData.append("telefono", data.telefono.replace(/\D/g, ""));
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      if (images.length > 0) {
        formData.append("foto", images[0]);
      }

      // Envío de datos al servicio backend / Supabase
      await register(formData);

      setLoading(false);
      setShowSuccessModal(true);

      redirectTimerRef.current = setTimeout(() => {
        reset();
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setLoading(false);
      setServerError(
        err.response?.data?.message || "Ocurrió un error al registrarte en el servidor."
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

        <form className="register_card" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2>Crear Cuenta</h2>

          <ImageUploader images={images} setImages={setImages} maxFiles={1} />

          {/* Nombre */}
          <label>Nombre *</label>
          <input
            type="text"
            placeholder="Nombre"
            {...registerField("nombre", {
              required: "El nombre es obligatorio",
              minLength: {
                value: 3,
                message: "El nombre debe tener al menos 3 caracteres",
              },
            })}
          />
          {errors.nombre && <p className="register_error">{errors.nombre.message}</p>}

          {/* Apellido */}
          <label>Apellido *</label>
          <input
            type="text"
            placeholder="Apellido"
            {...registerField("apellido", {
              required: "El apellido es obligatorio",
              minLength: {
                value: 2,
                message: "El apellido debe tener al menos 2 caracteres",
              },
            })}
          />
          {errors.apellido && <p className="register_error">{errors.apellido.message}</p>}

          {/* Email */}
          <label>Correo electrónico *</label>
          <input
            type="email"
            placeholder="nombre@ejemplo.com"
            {...registerField("email", {
              required: "El email es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Ingresá un email válido",
              },
            })}
          />
          {errors.email && <p className="register_error">{errors.email.message}</p>}

          {/* Teléfono (Con Controller para gestionar la máscara de formateo) */}
          <label>Teléfono</label>
          <Controller
            name="telefono"
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="text"
                placeholder="11 1234-5678"
                value={value}
                onChange={(e) => onChange(formatPhone(e.target.value))}
                maxLength={13}
              />
            )}
          />

          {/* Contraseña */}
          <label>Contraseña *</label>
          <div className="password_input_container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...registerField("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres",
                },
              })}
            />
            <button
              type="button"
              className="password_toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.password && <p className="register_error">{errors.password.message}</p>}

          {/* Confirmar Contraseña */}
          <label>Confirmar contraseña *</label>
          <div className="password_input_container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...registerField("confirmPassword", {
                required: "Debes confirmar la contraseña",
                validate: (value) =>
                  value === passwordValue || "Las contraseñas no coinciden",
              })}
            />
            <button
              type="button"
              className="password_toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="register_error">{errors.confirmPassword.message}</p>
          )}

          {/* Términos y Condiciones */}
          <div className="terms_checkbox_container" style={{ margin: "15px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                {...registerField("terminos", {
                  required: "Debés aceptar los términos y condiciones",
                })}
              />
              <span style={{ fontSize: "14px" }}>Acepto los términos y condiciones *</span>
            </label>
            {errors.terminos && <p className="register_error">{errors.terminos.message}</p>}
          </div>

          {/* Error del servidor/API backend */}
          {serverError && <p className="register_error">{serverError}</p>}

          <button type="submit" className="register_button">
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
        </form>

        <div className="register_container">
          <span>¿Ya tienes una cuenta?</span>
          <button
            type="button"
            className="register_link"
            onClick={() => navigate("/login")}
          >
            Inicia sesión
          </button>
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