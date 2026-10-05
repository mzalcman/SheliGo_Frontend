import { useState, useEffect } from "react";
import "./header.css";
import { Bell, MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../../utils/get_image_url";
import BrandLogo from "../brand_logo/brand_logo";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mensajesSinLeer, setMensajesSinLeer] = useState<number>(0);

  useEffect(() => {
    const fetchMensajesSinLeer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("⚠️ [HEADER] No se encontró token en localStorage");
          return;
        }

        const response = await fetch("http://localhost:3000/chat/salas", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const resJson = await response.json();
          console.log("📨 [HEADER] Respuesta de salas recibida:", resJson);

          const rawSalas = resJson && Array.isArray(resJson.data) ? resJson.data : [];

          // Buscamos dinámicamente cualquier campo que suene a "sin leer"
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
        } else {
          console.error("❌ [HEADER] Error en la petición HTTP:", response.status);
        }
      } catch (error) {
        console.error("❌ [HEADER] Error de red al traer mensajes sin leer:", error);
      }
    };

    fetchMensajesSinLeer();
    
    // Consultamos cada 8 segundos para mantenerlo actualizado
    const interval = setInterval(fetchMensajesSinLeer, 8000);
    return () => clearInterval(interval);
  }, []);

  // Solo visual: resalta el icono de mensajes cuando estamos en el chat
  const chats_active = pathname.startsWith("/chat");

  return (
    <header className="header">
      <div className="header_inner">
        <div className="header_left">
          <button
            className="header_profile_button"
            onClick={() => navigate("/menu")}
            aria-label="Abrir menú"
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

          <BrandLogo size="sm" />
        </div>

        <div className="header_icons">
          {/* Wrapper relativo para posicionar el badge sobre el icono */}
          <div className="header_chat_button_wrapper">
            <button
              className={`header_icon_button ${chats_active ? "active" : ""}`}
              onClick={() => navigate('/chats')}
              aria-label="Mensajes"
            >
              <MessageCircle size={22} strokeWidth={2} />
            </button>

            {mensajesSinLeer > 0 && (
              <span className="header_unread_badge">
                {mensajesSinLeer}
              </span>
            )}
          </div>

          <button className="header_icon_button" aria-label="Notificaciones">
            <Bell size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;