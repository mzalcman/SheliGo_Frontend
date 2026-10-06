import { useState, useEffect } from "react";
import "./header.css";
import { Bell, MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../../utils/get_image_url";
import BrandLogo from "../brand_logo/brand_logo";
import { api } from "../../services/api";
import { useUnreadNotifications } from "../../hooks/use_unread_notifications";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mensajesSinLeer, setMensajesSinLeer] = useState<number>(0);
  const notificacionesSinLeer = useUnreadNotifications();

  useEffect(() => {
    const fetchMensajesSinLeer = async () => {
      try {
        if (!localStorage.getItem("token")) return;

        const response = await api.get("/chat/salas");
        const resJson = response.data;
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

        setMensajesSinLeer(totalSinLeer);
      } catch (error) {
        console.error("Error al traer mensajes sin leer:", error);
      }
    };

    fetchMensajesSinLeer();
    
    // Consultamos cada 8 segundos para mantenerlo actualizado
    const interval = setInterval(fetchMensajesSinLeer, 8000);
    return () => clearInterval(interval);
  }, []);

  // Solo visual: resalta el icono de mensajes cuando estamos en el chat
  const chats_active = pathname.startsWith("/chat");
  const notifications_active = pathname.startsWith("/notificaciones");
  const format_badge = (count: number) => (count > 99 ? "99+" : count);

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
          {/* Wrappers relativos para posicionar los badges sobre los iconos */}
          <div className="header_icon_wrapper">
            <button
              className={`header_icon_button ${chats_active ? "active" : ""}`}
              onClick={() => navigate('/chats')}
              aria-label="Mensajes"
            >
              <MessageCircle size={22} strokeWidth={2} />
            </button>

            {mensajesSinLeer > 0 && (
              <span className="header_unread_badge">
                {format_badge(mensajesSinLeer)}
              </span>
            )}
          </div>

          <div className="header_icon_wrapper">
            <button
              className={`header_icon_button ${notifications_active ? "active" : ""}`}
              onClick={() => navigate("/notificaciones")}
              aria-label={
                notificacionesSinLeer > 0
                  ? `Notificaciones, ${notificacionesSinLeer} sin leer`
                  : "Notificaciones"
              }
            >
              <Bell size={22} strokeWidth={2} />
            </button>

            {notificacionesSinLeer > 0 && (
              <span className="header_unread_badge header_notification_badge">
                {format_badge(notificacionesSinLeer)}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;