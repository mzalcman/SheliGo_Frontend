import "./notifications_page.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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

import {
  get_notifications,
  mark_as_read,
  mark_all_as_read,
  type NotificationItem,
} from "../../services/notifications_service";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);

        const notificaciones =
          await get_notifications();

        setNotifications(
          Array.isArray(notificaciones)
            ? notificaciones
            : []
        );
      } catch (error) {
        console.error(
          "Error al cargar las notificaciones:",
          error
        );

        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleMarkAsRead = async (
    notification: NotificationItem
  ) => {
    if (notification.leida) {
      return;
    }

    try {
      await mark_as_read(notification.id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                leida: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "No se pudo marcar la notificación como leída:",
        error
      );
    }
  };

  const handleMarkAllAsRead = async () => {
  if (markingAll) {
    return;
  }

  console.log(
    "FRONT: ejecutando marcar todas como leídas"
  );

  try {
    setMarkingAll(true);

    const response =
      await mark_all_as_read();

    console.log(
      "FRONT: backend respondió correctamente",
      response
    );

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        leida: true,
      }))
    );

    console.log(
      "FRONT: notificaciones actualizadas"
    );
  } catch (error) {
    console.error(
      "FRONT: no se pudieron marcar todas como leídas",
      error
    );
  } finally {
    setMarkingAll(false);
  }
};

  const handleNotificationClick = async (
    notification: NotificationItem
  ) => {
    await handleMarkAsRead(notification);

    const tipoLower =
      notification.tipo?.toLowerCase() || "";

    if (tipoLower === "seguridad") {
      navigate(
        "/privacidad-y-seguridad"
      );
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
      navigate(
        `/chats?pub=${encodeURIComponent(
          notification.publicacion_id
        )}`
      );

      return;
    }

    navigate(
      `/publicacion/${notification.publicacion_id}`
    );
  };

  const renderNotificationIcon = (
    tipo: string
  ) => {
    const tipoLower =
      tipo?.toLowerCase() || "";

    switch (tipoLower) {
      case "nueva_coincidencia":
      case "coincidencia":
        return (
          <Sparkles
            size={23}
            color="#ff6f00"
          />
        );

      case "seguridad":
        return (
          <ShieldCheck
            size={23}
            color="#ff6f00"
          />
        );

      case "nueva_pregunta":
        return (
          <MessageSquare
            size={23}
            color="#ff6f00"
          />
        );

      case "nueva_respuesta":
        return (
          <CheckCheck
            size={23}
            color="#ff6f00"
          />
        );

      case "nuevo_chat":
      case "nueva_conversacion":
      case "nuevo_mensaje":
      default:
        return (
          <MessageCircle
            size={23}
            color="#ff6f00"
          />
        );
    }
  };

  const getActionButtonText = (
    tipo: string
  ) => {
    const tipoLower =
      tipo?.toLowerCase() || "";

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

  const formatTimeAgo = (
    dateString: string
  ) => {
    const date = new Date(
      dateString
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    const now = new Date();

    const diffInMs =
      now.getTime() -
      date.getTime();

    if (diffInMs < 0) {
      return "AHORA MISMO";
    }

    const diffInMinutes =
      Math.floor(
        diffInMs / (1000 * 60)
      );

    const diffInHours =
      Math.floor(
        diffInMinutes / 60
      );

    if (diffInMinutes < 1) {
      return "AHORA MISMO";
    }

    if (diffInMinutes < 60) {
      return `HACE ${diffInMinutes} MIN`;
    }

    if (
      diffInHours < 24 &&
      date.toDateString() ===
        now.toDateString()
    ) {
      return `HACE ${diffInHours} HS`;
    }

    const yesterday =
      new Date(now);

    yesterday.setDate(
      now.getDate() - 1
    );

    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "AYER";
    }

    return date.toLocaleDateString(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );
  };

  const groupNotificationsByDate = (
    list: NotificationItem[]
  ): Record<
    string,
    NotificationItem[]
  > => {
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const yesterday =
      new Date(today);

    yesterday.setDate(
      today.getDate() - 1
    );

    const groups: Record<
      string,
      NotificationItem[]
    > = {
      HOY: [],
      AYER: [],
      ANTERIORES: [],
    };

    list.forEach((item) => {
      const itemDate = new Date(
        item.created_at
      );

      if (
        Number.isNaN(
          itemDate.getTime()
        )
      ) {
        groups.ANTERIORES.push(
          item
        );
      } else if (
        itemDate >= today
      ) {
        groups.HOY.push(item);
      } else if (
        itemDate >= yesterday
      ) {
        groups.AYER.push(item);
      } else {
        groups.ANTERIORES.push(
          item
        );
      }
    });

    return groups;
  };

  if (loading) {
    return <Loader />;
  }

  const grouped =
    groupNotificationsByDate(
      notifications
    );

  return (
    <div className="notifications_page">
      <Header />

      <main className="notifications_content">
        <div className="notifications_header">
          <div className="notifications_title_row">
            <button
              type="button"
              className="notifications_back_btn"
              onClick={() =>
                navigate(-1)
              }
              aria-label="Volver"
            >
              <ArrowLeft
                size={26}
                color="#ff6f00"
                strokeWidth={2.5}
              />
            </button>

            <h1>
              Notificaciones
            </h1>
          </div>

          <p>
            Gestiona tus hallazgos y reportes
          </p>

          <button
            type="button"
            className="mark_all_read_btn"
            onClick={() =>
              void handleMarkAllAsRead()
            }
            disabled={markingAll}
          >
            <CheckCheck size={17} />

            {markingAll
              ? "Marcando..."
              : "Marcar todas como leídas"}
          </button>
        </div>

        <section className="notifications_list">
          {Object.entries(
            grouped
          ).map(
            ([
              groupKey,
              items,
            ]) => {
              if (
                items.length === 0
              ) {
                return null;
              }

              return (
                <div
                  className="notifications_group"
                  key={groupKey}
                >
                  <h2 className="notifications_group_title">
                    {groupKey}
                  </h2>

                  {items.map(
                    (item) => (
                      <article
                        className={`notification_card ${
                          !item.leida
                            ? "unread"
                            : ""
                        }`}
                        key={item.id}
                        onClick={() =>
                          void handleNotificationClick(
                            item
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            event.preventDefault();

                            void handleNotificationClick(
                              item
                            );
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
                          {renderNotificationIcon(
                            item.tipo
                          )}
                        </div>

                        <div className="notification_info">
                          <div className="notification_top">
                            <h3 className="notification_title">
                              {item.titulo}
                            </h3>

                            <span className="notification_time">
                              {formatTimeAgo(
                                item.created_at
                              )}
                            </span>
                          </div>

                          {item.contenido && (
                            <p className="notification_description">
                              {
                                item.contenido
                              }
                            </p>
                          )}

                          <button
                            type="button"
                            className="notification_action"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              void handleNotificationClick(
                                item
                              );
                            }}
                          >
                            {getActionButtonText(
                              item.tipo
                            )}
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              );
            }
          )}

          {notifications.length ===
            0 && (
            <div className="notifications_empty">
              <MessageSquare
                size={36}
                color="#a0a0a0"
              />

              <p>
                No tienes notificaciones por el momento.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationsPage;