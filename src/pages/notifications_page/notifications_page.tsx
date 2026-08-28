import "./notifications_page.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { MessageSquarePlus, MessageCircle, HelpCircle, MessageSquare, ShieldCheck, Sparkles,CheckCheck} from "lucide-react";
import Loader from "../../components/loader/loader";
import { get_notifications, mark_as_read } from "../../services/notifications_service";

interface NotificationItem {
  id: string;
  usuario_id: string;
  publicacion_id?: string;
  titulo: string;
  contenido: string;
  tipo: "NUEVA_CONVERSACION" | "NUEVO_MENSAJE" | "NUEVA_PREGUNTA" | "NUEVA_RESPUESTA" | "SEGURIDAD" | "COINCIDENCIA";
  leida: boolean;
  created_at: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    usuario_id: "usr1",
    publicacion_id: "pub123",
    titulo: "¡Encontramos una coincidencia!",
    contenido: "Hay un objeto publicado que coincide con tu reporte.",
    tipo: "COINCIDENCIA",
    leida: false,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // Hace 2 min
  },
  {
    id: "2",
    usuario_id: "usr1",
    titulo: "Actualizamos nuestras políticas de seguridad",
    contenido: "Revisa los nuevos términos de uso y protección de datos.",
    tipo: "SEGURIDAD",
    leida: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Hace 15 min
  },
  {
    id: "3",
    usuario_id: "usr1",
    publicacion_id: "pub456",
    titulo: "Te preguntaron sobre un objeto que encontraste",
    contenido: "Un usuario realizó una pregunta sobre tu publicación.",
    tipo: "NUEVA_PREGUNTA",
    leida: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
  },
  {
    id: "4",
    usuario_id: "usr1",
    publicacion_id: "pub789",
    titulo: "Nueva conversación",
    contenido: "Un usuario se comunicó contigo por una de tus publicaciones.",
    tipo: "NUEVA_CONVERSACION",
    leida: true,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // Hace 2 días
  }
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await get_notifications();
      setNotifications(data?.length ? data : MOCK_NOTIFICATIONS);
    } catch (error) {
      console.warn("Backend no disponible, cargando mock data de notificaciones.");
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.leida) {
      try {
        await mark_as_read(notification.id);
      } catch (e) {
        console.warn("No se pudo marcar como leída en backend.");
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, leida: true } : n))
      );
    }

    if (notification.publicacion_id) {
      if (notification.tipo === "NUEVA_CONVERSACION" || notification.tipo === "NUEVO_MENSAJE") {
        navigate(`/chats?pub=${notification.publicacion_id}`);
      } else {
        navigate(`/publicacion/${notification.publicacion_id}`);
      }
    }
  };

  const renderNotificationIcon = (tipo: NotificationItem["tipo"]) => {
    switch (tipo) {
      case "COINCIDENCIA":
        return (
          <div className="notif_icon_box icon_sparkles">
            <Sparkles size={22} />
          </div>
        );
      case "SEGURIDAD":
        return (
          <div className="notif_icon_box icon_security">
            <ShieldCheck size={22} />
          </div>
        );
      case "NUEVA_PREGUNTA":
        return (
          <div className="notif_icon_box icon_question">
            <HelpCircle size={22} />
          </div>
        );
      case "NUEVA_RESPUESTA":
        return (
          <div className="notif_icon_box icon_answer">
            <MessageSquare size={22} />
          </div>
        );
      case "NUEVA_CONVERSACION":
        return (
          <div className="notif_icon_box icon_chat">
            <MessageSquarePlus size={22} />
          </div>
        );
      case "NUEVO_MENSAJE":
      default:
        return (
          <div className="notif_icon_box icon_message">
            <MessageCircle size={22} />
          </div>
        );
    }
  };

  const getActionButtonText = (tipo: NotificationItem["tipo"]) => {
    switch (tipo) {
      case "COINCIDENCIA":
        return "Ver coincidencia";
      case "SEGURIDAD":
        return "Ver políticas";
      case "NUEVA_PREGUNTA":
        return "Responder";
      case "NUEVA_RESPUESTA":
        return "Ver respuesta";
      case "NUEVA_CONVERSACION":
      case "NUEVO_MENSAJE":
        return "Ir al chat";
      default:
        return "Ver detalle";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return "AHORA MISMO";
    if (diffInMinutes < 60) return `HACE ${diffInMinutes} MIN`;
    if (diffInHours < 24 && date.getDate() === now.getDate()) return `HACE ${diffInHours} HS`;
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
      return "AYER";
    }

    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
  };

  const groupNotificationsByDate = (list: NotificationItem[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const groups: { [key: string]: NotificationItem[] } = {
      HOY: [],
      AYER: [],
      ANTERIORES: [],
    };

    list.forEach((item) => {
      const itemDate = new Date(item.created_at);
      if (itemDate >= today) {
        groups.HOY.push(item);
      } else if (itemDate >= yesterday) {
        groups.AYER.push(item);
      } else {
        groups.ANTERIORES.push(item);
      }
    });

    return groups;
  };

  if (loading) {
    return <Loader />;
  }

  const grouped = groupNotificationsByDate(notifications);

  return (
    <main className="notifications_page">
        <Header />
      <header className="notifications_header">
        <h1>Notificaciones</h1>
        <p className="notifications_subtitle">Gestiona tus hallazgos y reportes</p>
      </header>

      <div className="notifications_content">
        {Object.keys(grouped).map((groupKey) => {
          const items = grouped[groupKey];
          if (items.length === 0) return null;

          return (
            <section key={groupKey} className="notification_group">
              <h2 className="group_title">{groupKey}</h2>
              <div className="notification_list">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className={`notification_card ${!item.leida ? "unread" : ""}`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    {!item.leida && <span className="unread_badge_dot" />}

                    <div className="notification_card_body">
                      {renderNotificationIcon(item.tipo)}

                      <div className="notification_main_info">
                        <div className="notification_top_row">
                          <h3 className="notification_title">{item.titulo}</h3>
                          <span className="notification_time">
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>

                        {item.contenido && (
                          <p className="notification_description">{item.contenido}</p>
                        )}

                        <button
                          type="button"
                          className="notification_action_btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(item);
                          }}
                        >
                          {getActionButtonText(item.tipo)}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {notifications.length === 0 && (
          <div className="notifications_empty">
            <CheckCheck size={48} color="#b0b0b0" />
            <p>No tienes notificaciones por el momento.</p>
          </div>
        )}
      </div>
    <Footer />
    </main>
  );
};

export default NotificationsPage;