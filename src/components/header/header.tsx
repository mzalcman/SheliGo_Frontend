import { useState, useEffect } from "react";
import "./header.css";
import { Bell, MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/get_image_url";
import { api } from "../../services/api";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mensajesSinLeer, setMensajesSinLeer] = useState<number>(0);

  useEffect(() => {
    const fetchMensajesSinLeer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("⚠️ [HEADER] No se encontró token en localStorage");
          return;
        }

        const response = await api.get("/chat/salas");
        const resJson = response.data;

        console.log("📨 [HEADER] Respuesta de salas recibida:", resJson);

        const rawSalas = resJson && Array.isArray(resJson.data) ? resJson.data : [];

        const totalSinLeer = rawSalas.reduce((acumulado: number, sala: any) => {
          const sinLeerCount = parseInt(
            sala.mensajes_sin_leer ?? 
            sala.mensajes_no_leidos ?? 
            sala.sin_leer ?? 
            sala.unread_count ?? 
            "0", 
            10
          );
          return acumulado + (isNaN(sinLeerCount) ? 0 : sinLeerCount);
        }, 0);

        console.log("🔴 [HEADER] Total de mensajes sin leer calculado:", totalSinLeer);
        setMensajesSinLeer(totalSinLeer);
      } catch (error) {
        console.error("❌ [HEADER] Error de red al traer mensajes sin leer:", error);
      }
    };

    fetchMensajesSinLeer();
    
    const interval = setInterval(fetchMensajesSinLeer, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <button
        className="header_profile_button"
        onClick={() => navigate("/menu")}
      >
        <img
          src={
            user?.profile_image
              ? getImageUrl(user.profile_image)
              : "/user_predeterminada.png"
          }
          alt="user profile"
          className="header_profile_image"
          onError={(event) => {
            event.currentTarget.src = "/user_predeterminada.png";
          }}
        />
      </button>

      <div className="header_icons">
        <div className="header_chat_button_wrapper">
          <button 
            className="header_icon_button" 
            onClick={() => navigate('/chats')}
          >
            <MessageCircle
              size={34}
              strokeWidth={2.2}
            />
          </button>
          
          {mensajesSinLeer > 0 && (
            <span className="header_unread_badge">
              {mensajesSinLeer}
            </span>
          )}
        </div>

        <button 
          className="header_icon_button"
          onClick={() => navigate('/notificaciones')}
        >
          <Bell
            size={34}
            strokeWidth={2.2}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;