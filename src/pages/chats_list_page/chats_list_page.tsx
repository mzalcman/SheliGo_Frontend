import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./chats_list_page.css";
import { getImageUrl } from "../../utils/get_image_url";

interface ChatRoom {
  sala_id: string;
  usuario_nombre: string;
  usuario_avatar: string;
  ultimo_mensaje: string;
  ultimo_mensaje_tiempo: string;
  leido: boolean;
  enviado_por_mi: boolean; // Si el último mensaje lo mandaste vos
  receptor_leyo_mi_mensaje: boolean; // Si la otra persona leyó tu mensaje
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

          const rawSalas = resJson && Array.isArray(resJson.data) ? resJson.data : [];

          const salasMapeadas: ChatRoom[] = rawSalas.map((sala: any) => {
            const nombre = sala.otro_usuario_nombre || "";
            const apellido = sala.otro_usuario_apellido || "";
            const nombreCompleto = `${nombre} ${apellido}`.trim() || "Usuario";

            // Procesamos la foto
            const avatarPath = sala.otro_usuario_foto;
            let avatarUrl = "/user_predeterminada.png";
            if (avatarPath) {
              if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
                avatarUrl = avatarPath;
              } else {
                avatarUrl = getImageUrl(avatarPath);
              }
            }

            // Formateamos la hora
            let tiempoFormateado = "";
            if (sala.ultimo_mensaje_fecha) {
              const fecha = new Date(sala.ultimo_mensaje_fecha);
              tiempoFormateado = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }

            const sinLeerCount = parseInt(sala.mensajes_sin_leer || "0", 10);

            // 🎯 Lógica de tics:
            // Si el backend te marca la sala con mensajes sin leer enviados por OTRO, enviado_por_mi es false.
            // Si te devuelve un flag o si deducimos quién lo mandó (ej. si sala.ultimo_mensaje_enviado_por_mi existe):
            const enviadoPorMi = sala.ultimo_mensaje_enviado_por_mi ?? false; 
            
            // Si lo mandaste vos, y el otro no tiene mensajes pendientes de leer en esta sala (ej: "0" sin leer)
            const receptorLeyoMiMensaje = enviadoPorMi && sinLeerCount === 0;

            return {
              sala_id: sala.sala_id,
              usuario_nombre: nombreCompleto,
              usuario_avatar: avatarUrl,
              ultimo_mensaje: sala.ultimo_mensaje || "Sin mensajes",
              ultimo_mensaje_tiempo: tiempoFormateado,
              leido: sinLeerCount === 0,
              enviado_por_mi: enviadoPorMi, 
              receptor_leyo_mi_mensaje: receptorLeyoMiMensaje
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
                  <div className="chats_card_top_row">
                    <span className="chats_user_name">{chat.usuario_nombre}</span>
                    <span className="chats_time_text">{chat.ultimo_mensaje_tiempo}</span>
                  </div>

                  <div className="chats_card_bottom_row">
                    <span className="chats_preview_message">
                      {/* TICS DINÁMICOS:
                          Si lo mandaste vos, pintamos el tic.
                          Si la otra persona lo leyó, le metemos la clase "read" (naranja), si no, "unread" (gris) 
                      */}
                      {chat.enviado_por_mi && (
                        <span className={`chats_double_check ${chat.receptor_leyo_mi_mensaje ? "read" : "unread"}`}>
                          ✓✓{" "}
                        </span>
                      )}
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