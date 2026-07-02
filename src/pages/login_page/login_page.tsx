import "./login_page.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth_service";
import Loader from "../../components/loader/loader";
import { useAuth } from "../../hooks/use_auth";
import { Eye, EyeOff } from "lucide-react";


const LoginPage = () => {
  const navigate = useNavigate();
  const { login: loginContext, loginWithGoogle, user } = useAuth();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (user) {
      navigate("/home");
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


      // 🛠️ SOLUCIÓN: Buscamos de forma flexible si viene en response directo o en response.data
      const token = response?.token || response?.data?.token;
      const usuario = response?.usuario || response?.data?.usuario;


      if (!token || !usuario) {
        throw new Error("Respuesta inválida del servidor");
      }


      localStorage.setItem("token", token);
      loginContext(usuario);
      navigate("/home");


    } catch (error: any) {
      console.error(error);
      setLoading(false);
      setError("Correo o contraseña incorrectos.");
    }
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


          <div style={{ margin: "15px 0", textAlign: "center", color: "#888", fontSize: "14px" }}>
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
            onClick={() => navigate("/register")}
          >
            Regístrate gratis
          </button>
        </div>
      </div>
    </main>
  );
};


export default LoginPage;


