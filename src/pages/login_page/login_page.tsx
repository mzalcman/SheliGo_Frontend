import "./login_page.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth_service";
import {
  Eye, EyeOff,
} from "lucide-react";

const LoginPage = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const is_valid_email =
    (value: string) => {

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(value);
    };
  const handle_login =
    async () => {

      setError("");
      if (
        !is_valid_email(email)
      ) {
        setError(
          "Ingresa un correo válido."
        );
        return;
      }
      try {

        const response =
          await login(
            email,
            password
          );

        localStorage.setItem(
          "token",
          response.token
        );

        navigate("/home");

      } catch {
        setError(
          "Correo o contraseña incorrectos."
        );
      }
    };
  return (
    <main className="login_page">
      <div className="login_top" />
      <div className="login_content">
        <h1 className="login_logo">
          SheliGo
        </h1>

        <p className="login_subtitle">
          Encuentra lo que perdiste,
          devuelve lo que encontraste.
        </p>

        <div className="login_card">

          <h2>
            Iniciar Sesión
          </h2>

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
          />

          <label>
            Contraseña
          </label>

          <div className="password_input_container">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
            <button
              type="button"
              className="password_toggle"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <Eye size={20} />
              ) : (
                <EyeOff size={20} />
              )}
            </button>
          </div>

          {error && (

            <p className="login_error">
              {error}
            </p>

          )}

          <button
            className="login_button"
            onClick={handle_login}>
            Entrar
          </button>

          <div className="login_google">
            Google
          </div>

        </div>

        <div className="register_container">
          <span>
            ¿No tienes una cuenta?
          </span>

          <button
            className="register_link">
            Regístrate gratis
          </button>
        </div>
      </div>
    </main>

  );

};

export default LoginPage;