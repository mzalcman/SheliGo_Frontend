
import "./notifications_page.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Loader from "../../components/loader/loader";
import {
  get_notifications,
  mark_as_read,
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

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    usuario_id: "usr1",
    publicacion_id: "pub123",
    titulo: "¡Encontramos una coincidencia!",
    contenido: "Hay un objeto publicado que coincide con tu reporte.",
    tipo: "nueva_coincidencia",
    leida: false,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    usuario_id: "usr1",
    titulo: "Actualizamos nuestras políticas de seguridad",
    contenido: "Revisa los nuevos términos de uso y protección de datos.",
    tipo: "seguridad",
    leida: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    usuario_id: "usr1",
    publicacion_id: "pub456",
    titulo: "Te preguntaron sobre un objeto que encontraste",
    contenido: "Un usuario realizó una pregunta sobre tu publicación.",
    tipo: "nueva_pregunta",
    leida: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    usuario_id: "usr1",
    publicacion_id: "pub789",
    titulo: "Nueva conversación",
    contenido: "Un usuario se comunicó contigo por una de tus publicaciones.",
    tipo: "nuevo_chat",
    leida: true,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const res = await get_notifications();

        const notifsList: NotificationItem[] =
          res?.data?.notificaciones ??
          (Array.isArray(res) ? res : []);

        setNotifications(
          notifsList.length > 0 ? notifsList : MOCK_NOTIFICATIONS
        );
      } catch (error) {
        console.warn(
          "Backend no disponible. Cargando notificaciones de prueba.",
          error
        );
        setNotifications(MOCK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };

    void fetchNotifications();
  }, []);

  const handleNotificationClick = async (
    notification: NotificationItem
  ) => {
    if (!notification.leida) {
      // Actualización optimista de la notificación.
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, leida: true }
            : item
        )
      );

      try {
        await mark_as_read(notification.id);
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
        return <Sparkles size={23} color="#ff6f00" />;

      case "seguridad":
        return <ShieldCheck size={23} color="#ff6f00" />;

      case "nueva_pregunta":
        return <MessageSquare size={23} color="#ff6f00" />;

      case "nueva_respuesta":
        return <CheckCheck size={23} color="#ff6f00" />;

      case "nuevo_chat":
      case "nueva_conversacion":
        return <MessageCircle size={23} color="#ff6f00" />;

      case "nuevo_mensaje":
      default:
        return <MessageCircle size={23} color="#ff6f00" />;
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

  return (
    <div className="notifications_page">
      <Header />

      <main className="notifications_content">
        <div className="notifications_header">
          <h1>Notificaciones</h1>
          <p>Gestiona tus hallazgos y reportes</p>
        </div>

        <section className="notifications_list">
          {Object.entries(grouped).map(([groupKey, items]) => {
            if (items.length === 0) return null;

            return (
              <div
                className="notifications_group"
                key={groupKey}
              >
                <h2 className="notifications_group_title">
                  {groupKey}
                </h2>

                {items.map((item) => (
                  <article
                    className={`notification_card ${
                      !item.leida ? "unread" : ""
                    }`}
                    key={item.id}
                    onClick={() => void handleNotificationClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        void handleNotificationClick(item);
                      }
                    }}
                  >
                    {!item.leida && (
                      <span
                        className="notification_unread_dot"
                        aria-label="No leída"
                      />
                    )}

                    <div className="notification_icon">
                      {renderNotificationIcon(item.tipo)}
                    </div>

                    <div className="notification_info">
                      <div className="notification_top">
                        <h3 className="notification_title">
                          {item.titulo}
                        </h3>

                        <span className="notification_time">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>

                      {item.contenido && (
                        <p className="notification_description">
                          {item.contenido}
                        </p>
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
                  </article>
                ))}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="notifications_empty">
              <MessageSquare size={36} color="#a0a0a0" />
              <p>No tienes notificaciones por el momento.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationsPage;