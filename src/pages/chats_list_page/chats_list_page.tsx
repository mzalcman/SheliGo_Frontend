import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./chats_list_page.css";
import { getImageUrl, } from "../../utils/get_image_url";

interface ChatRoom {
  sala_id: string;
  usuario_nombre: string;
  usuario_avatar: string;
  ultimo_mensaje: string;
  ultimo_mensaje_tiempo: string;
  leido: boolean;
  enviado_por_mi: boolean;
}

const ChatsListPage = () => {
  const navigate = useNavigate();
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
          console.log("ESTO LLEGA DEL BACKEND:", resJson);

          // Extraemos la lista según el formato estándar del back { status, data: [...] }
          const rawSalas = resJson && Array.isArray(resJson.data) ? resJson.data : [];

          // Mapeamos la estructura del Back a la estructura que tu UI necesita
          const salasMapeadas: ChatRoom[] = rawSalas.map((sala: any) => {
            const otroUsuario = sala.otro_usuario || {};
            const nombreCompleto = `${otroUsuario.nombre || ""} ${otroUsuario.apellido || ""}`.trim() || "Usuario";

            let tiempoFormateado = "";
            if (sala.ultimo_mensaje_fecha) {
              const fecha = new Date(sala.ultimo_mensaje_fecha);
              tiempoFormateado = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }

            // 🎯 ACÁ APLICAMOS LA MAGIA:
            // Si existe foto, le generamos la URL pública. Si no, usamos el fallback.
            const avatarPath = otroUsuario.foto;
            const avatarUrl = avatarPath ? getImageUrl(avatarPath) : "/user_predeterminada.png";

            return {
              sala_id: sala.sala_id,
              usuario_nombre: nombreCompleto,
              usuario_avatar: avatarUrl, // Ahora ya va con la URL completa y segura
              ultimo_mensaje: sala.ultimo_mensaje || "Sin mensajes",
              ultimo_mensaje_tiempo: tiempoFormateado,
              leido: sala.mensajes_sin_leer === 0,
              enviado_por_mi: false
            };
          });

          setChats(salasMapeadas);
        } else {
          console.error("Error al traer salas (HTTP:", response.status, ")");
          setChats([]);
        }
      } catch (error) {
        console.error("Error al conectar con la API de salas:", error);
        setChats([]);
      } finally {
        setCargando(false);
      }
    };

    fetchSalas();
  }, [filter]);

  const chatsSeguros = Array.isArray(chats) ? chats : [];

  const filteredChats = chatsSeguros.filter((chat) =>
    chat && chat.usuario_nombre
      ? chat.usuario_nombre.toLowerCase().includes(searchQuery.toLowerCase())
      : false
  );

  return (
    <div className="chats_container_page">
      <Header />

      <main className="chats_content">
        <h1 className="chats_main_title">Mensajes</h1>

        {/* Buscador */}
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

        {/* Categorías */}
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

        {/* Lista de salas */}
        <div className="chats_list">
          {cargando ? (
            <p className="chats_empty_text">Cargando conversaciones...</p>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.sala_id}
                className={`chats_item_card ${!chat.leido ? "unread_bg" : ""}`}
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
                  <div className="chats_card_top_row">
                    <span className="chats_user_name">{chat.usuario_nombre}</span>
                    <span className="chats_time_text">{chat.ultimo_mensaje_tiempo}</span>
                  </div>

                  <div className="chats_card_bottom_row">
                    <span className="chats_preview_message">
                      {chat.enviado_por_mi && <span className="chats_double_check">✓✓ </span>}
                      {chat.ultimo_mensaje}
                    </span>
                    {!chat.leido && <div className="chats_unread_dot" />}
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