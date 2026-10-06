import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Camera, MessagesSquare } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useAuth } from "../../hooks/use_auth"; 
import { api } from "../../services/api";
import "./chats_list_page.css";
import { getImageUrl } from "../../utils/get_image_url";
import EmptyState from "../../components/empty_state/empty_state";

interface ChatRoom {
  sala_id: string;
  usuario_nombre: string;
  usuario_avatar: string;
  ultimo_mensaje: string;
  ultimo_mensaje_tiempo: string;
  leido: boolean;
  es_foto: boolean;
}

const esRutaImagen = (texto?: string): boolean => {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return (
    t.startsWith("chats/") ||
    t.endsWith(".jpg") ||
    t.endsWith(".jpeg") ||
    t.endsWith(".png") ||
    t.endsWith(".webp")
  );
};

const formatMensajeTiempo = (fechaRaw?: string) => {
  if (!fechaRaw) return "";
  const fechaMensaje = new Date(fechaRaw);
  
  if (isNaN(fechaMensaje.getTime())) return "";

  const hoy = new Date();

  const esHoy =
    fechaMensaje.getDate() === hoy.getDate() &&
    fechaMensaje.getMonth() === hoy.getMonth() &&
    fechaMensaje.getFullYear() === hoy.getFullYear();

  if (esHoy) {
    return fechaMensaje.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    const dia = fechaMensaje.getDate();
    const mes = fechaMensaje.getMonth() + 1;
    return `${dia}/${mes}`;
  }
};

const ChatsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "no_leidos" | "leidos">("todos");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        setCargando(true);

        let url = "/chat/salas";
        if (filter === "no_leidos") {
          url += "?filtro=no_leidas";
        } else if (filter === "leidos") {
          url += "?filtro=leidas";
        }

        const response = await api.get(url);
        const resJson = response.data;
        const rawSalas = resJson && Array.isArray(resJson.data) ? resJson.data : [];

        const salasMapeadas: ChatRoom[] = rawSalas.map((sala: any) => {
          const nombre = sala.otro_usuario_nombre || "";
          const apellido = sala.otro_usuario_apellido || "";
          const nombreCompleto = `${nombre} ${apellido}`.trim() || "Usuario";

          const avatarPath = sala.otro_usuario_foto;
          let avatarUrl = "/user_predeterminada.png";
          if (avatarPath) {
            if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
              avatarUrl = avatarPath;
            } else {
              avatarUrl = getImageUrl(avatarPath);
            }
          }

          const tiempoFormateado = formatMensajeTiempo(sala.ultimo_mensaje_fecha);
          const sinLeerCount = parseInt(sala.mensajes_sin_leer || "0", 10);
          const msgTexto = sala.ultimo_mensaje || "Sin mensajes";

          return {
            sala_id: sala.sala_id,
            usuario_nombre: nombreCompleto,
            usuario_avatar: avatarUrl,
            ultimo_mensaje: msgTexto,
            ultimo_mensaje_tiempo: tiempoFormateado,
            leido: sinLeerCount === 0,
            es_foto: esRutaImagen(msgTexto)
          };
        });

        setChats(salasMapeadas);
      } catch (error) {
        console.error("Error al conectar con la API de salas:", error);
        setChats([]);
      } finally {
        setCargando(false);
      }
    };

    if (user) {
      fetchSalas();
    }
  }, [filter, user]);

  const chatsSeguros = Array.isArray(chats) ? chats : [];
  const filteredChats = chatsSeguros.filter((chat) =>
    chat?.usuario_nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chats_container_page">
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
          <h1 className="page_title">Mensajes</h1>
        </div>

        <div className="chats_search_wrapper">
          <Search className="chats_search_icon" size={18} />
          <input
            type="text"
            placeholder="Buscar chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form_input chats_search_input"
          />
        </div>

        <div className="chats_filter_chips">
          <button
            className={`chats_chip ${filter === "todos" ? "active" : ""}`}
            onClick={() => setFilter("todos")}
          >
            Todos
          </button>
          <button
            className={`chats_chip ${filter === "no_leidos" ? "active" : ""}`}
            onClick={() => setFilter("no_leidos")}
          >
            No leídos
          </button>
          <button
            className={`chats_chip ${filter === "leidos" ? "active" : ""}`}
            onClick={() => setFilter("leidos")}
          >
            Leídos
          </button>
        </div>

        <div className="chats_list">
          {cargando ? (
            <div className="chats_loading">
              <div className="spinner" />
              <p>Cargando conversaciones...</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.sala_id}
                className={`chats_item_card ${!chat.leido ? "unread" : ""}`}
                onClick={() => navigate(`/chat/${chat.sala_id}`, { state: { usuario: chat } })}
              >
                <img
                  src={chat.usuario_avatar}
                  alt={chat.usuario_nombre}
                  className="chats_avatar"
                  onError={(event) => {
                    event.currentTarget.src = "/user_predeterminada.png";
                  }}
                />

                <div className="chats_card_info">
                  <div className="chats_card_left_content">
                    <span className="chats_user_name">{chat.usuario_nombre}</span>
                    <span className="chats_preview_message">
                      {chat.es_foto ? (
                        <span className="chats_preview_photo">
                          <Camera size={15} strokeWidth={2} /> Foto
                        </span>
                      ) : (
                        chat.ultimo_mensaje
                      )}
                    </span>
                  </div>

                  <div className="chats_card_right_content">
                    <span className="chats_time_text">{chat.ultimo_mensaje_tiempo}</span>
                    {!chat.leido && <span className="chats_unread_dot" />}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={MessagesSquare}
              title="No tenés conversaciones en esta lista."
              compact
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatsListPage;