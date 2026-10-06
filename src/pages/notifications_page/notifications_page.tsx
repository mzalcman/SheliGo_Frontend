import "./notifications_page.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Loader from "../../components/loader/loader";
import EmptyState from "../../components/empty_state/empty_state";
import {
  get_notifications,
  mark_as_read,
  extract_notifications,
  notify_notifications_updated,
} from "../../services/notifications_service";

export type NotificationType =
  | "nueva_pregunta"
  | "nueva_respuesta"
  | "nueva_coincidencia"
  | "nuevo_mensaje"
  | "nuevo_chat"
  | "seguridad"
  | string;

export interface NotificationItem {
  id: string;
  usuario_id: string;
  publicacion_id?: string;
  titulo: string;
  contenido: string;
  tipo: NotificationType;
  leida: boolean;
  created_at: string;
  updated_at?: string;
}

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await get_notifications();
        setNotifications(extract_notifications(res));
      } catch (error) {
        console.error("Error al cargar las notificaciones:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleNotificationClick = async (
    notification: NotificationItem
  ) => {
    if (!notification.leida) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, leida: true }
            : item
        )
      );

      try {
        await mark_as_read(notification.id);
        notify_notifications_updated();
      } catch (error) {
        console.warn(
          "No se pudo marcar la notificación como leída.",
          error
        );
      }
    }

    const tipoLower = notification.tipo?.toLowerCase();

    if (tipoLower === "seguridad") {
      navigate("/privacidad-y-seguridad");
      return;
    }

    if (!notification.publicacion_id) {
      if (
        tipoLower === "nuevo_chat" ||
        tipoLower === "nuevo_mensaje" ||
        tipoLower === "nueva_conversacion"
      ) {
        navigate("/chats");
      }
      return;
    }

    if (
      tipoLower === "nuevo_chat" ||
      tipoLower === "nuevo_mensaje" ||
      tipoLower === "nueva_conversacion"
    ) {
      navigate(`/chats?pub=${encodeURIComponent(notification.publicacion_id)}`);
    } else {
      navigate(`/publicacion/${notification.publicacion_id}`);
    }
  };

  const renderNotificationIcon = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || "";

    switch (tipoLower) {
      case "nueva_coincidencia":
      case "coincidencia":
        return <Sparkles size={20} strokeWidth={2.2} />;

      case "seguridad":
        return <ShieldCheck size={20} strokeWidth={2.2} />;

      case "nueva_pregunta":
        return <MessageSquare size={20} strokeWidth={2.2} />;

      case "nueva_respuesta":
        return <CheckCheck size={20} strokeWidth={2.2} />;

      case "nuevo_chat":
      case "nueva_conversacion":
        return <MessageCircle size={20} strokeWidth={2.2} />;

      case "nuevo_mensaje":
      default:
        return <MessageCircle size={20} strokeWidth={2.2} />;
    }
  };

  const getActionButtonText = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || "";

    switch (tipoLower) {
      case "nueva_coincidencia":
      case "coincidencia":
        return "Ver coincidencia";

      case "seguridad":
        return "Ver políticas";

      case "nueva_pregunta":
        return "Responder";

      case "nueva_respuesta":
        return "Ver respuesta";

      case "nuevo_chat":
      case "nueva_conversacion":
      case "nuevo_mensaje":
        return "Ir al chat";

      default:
        return "Ver detalle";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();

    if (diffInMs < 0) {
      return "AHORA MISMO";
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return "AHORA MISMO";
    if (diffInMinutes < 60) return `HACE ${diffInMinutes} MIN`;

    if (
      diffInHours < 24 &&
      date.toDateString() === now.toDateString()
    ) {
      return `HACE ${diffInHours} HS`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "AYER";
    }

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const groupNotificationsByDate = (
    list: NotificationItem[]
  ): Record<string, NotificationItem[]> => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const groups: Record<string, NotificationItem[]> = {
      HOY: [],
      AYER: [],
      ANTERIORES: [],
    };

    list.forEach((item) => {
      const itemDate = new Date(item.created_at);

      if (Number.isNaN(itemDate.getTime())) {
        groups.ANTERIORES.push(item);
      } else if (itemDate >= today) {
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

  const unreadCount = notifications.filter((item) => !item.leida).length;

  return (
    <div className="notifications_page">
      <Header />

      <main className="page_container narrow">
        <div className="page_topbar">
          <button
            type="button"
            className="icon_button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <div className="notifications_heading">
            <h1 className="page_title">Notificaciones</h1>
            <p className="page_subtitle">Gestiona tus hallazgos y reportes</p>
          </div>
          {unreadCount > 0 && (
            <span className="notifications_unread_pill">
              {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
            </span>
          )}
        </div>

        <section className="notifications_list">
          {Object.entries(grouped).map(([groupKey, items]) => {
            if (items.length === 0) return null;

            return (
              <div className="notifications_group" key={groupKey}>
                <h2 className="notifications_group_title">{groupKey}</h2>

                {items.map((item) => (
                  <article
                    className={`notification_card ${!item.leida ? "unread" : ""}`}
                    key={item.id}
                    onClick={() => void handleNotificationClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void handleNotificationClick(item);
                      }
                    }}
                  >
                    <div className="notification_icon">
                      {renderNotificationIcon(item.tipo)}
                    </div>

                    <div className="notification_info">
                      <div className="notification_top">
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
                        className="notification_action"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleNotificationClick(item);
                        }}
                      >
                        {getActionButtonText(item.tipo)}
                      </button>
                    </div>

                    {!item.leida && (
                      <span className="notification_unread_dot" aria-label="No leída" />
                    )}
                  </article>
                ))}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <EmptyState
              icon={Bell}
              title="No tienes notificaciones por el momento."
              description="Te avisaremos acá cuando haya preguntas, respuestas o coincidencias con tus publicaciones."
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationsPage;