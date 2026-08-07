import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useAuth } from "../../hooks/use_auth"; 
import "./chats_list_page.css";
import { getImageUrl } from "../../utils/get_image_url";

interface ChatRoom {
  sala_id: string;
  usuario_nombre: string;
  usuario_avatar: string;
  ultimo_mensaje: string;
  ultimo_mensaje_tiempo: string;
  leido: boolean;
}

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
        const token = localStorage.getItem("token");

        let url = "http://localhost:3000/chat/salas";
        if (filter === "no_leidos") {
          url += "?filtro=no_leidas";
        } else if (filter === "leidos") {
          url += "?filtro=leidas";
        }

        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const resJson = await response.json();
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

            let tiempoFormateado = "";
            if (sala.ultimo_mensaje_fecha) {
              const fecha = new Date(sala.ultimo_mensaje_fecha);
              tiempoFormateado = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }

            const sinLeerCount = parseInt(sala.mensajes_sin_leer || "0", 10);

            return {
              sala_id: sala.sala_id,
              usuario_nombre: nombreCompleto,
              usuario_avatar: avatarUrl,
              ultimo_mensaje: sala.ultimo_mensaje || "Sin mensajes",
              ultimo_mensaje_tiempo: tiempoFormateado,
              leido: sinLeerCount === 0
            };
          });

          setChats(salasMapeadas);
        } else {
          console.error("Error al traer salas:", response.status);
          setChats([]);
        }
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

      <main className="chats_content">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <button 
            type="button" 
            className="room_back_btn" 
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
          >
            <ArrowLeft size={26} color="#ff6f00" strokeWidth={2.5} />
          </button>
          <h1 className="chats_main_title" style={{ margin: 0 }}>Mensajes</h1>
        </div>

        <div className="chats_search_wrapper">
          <Search className="chats_search_icon" size={20} color="#9e9e9e" />
          <input
            type="text"
            placeholder="Buscar chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="chats_search_input"
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
            <p className="chats_empty_text">Cargando conversaciones...</p>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.sala_id}
                className={`chats_item_card ${!chat.leido ? "unread_bg" : "read_bg"}`}
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
                    <span className="chats_preview_message">{chat.ultimo_mensaje}</span>
                  </div>

                  <div className="chats_card_right_content">
                    <span className="chats_time_text">{chat.ultimo_mensaje_tiempo}</span>
                    
                    <div className="chats_status_wrapper">
                      {!chat.leido && <div className="chats_unread_dot" />}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="chats_empty_text">No tenés conversaciones en esta lista.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatsListPage;