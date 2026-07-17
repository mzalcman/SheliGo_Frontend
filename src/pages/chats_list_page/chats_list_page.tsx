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
  enviado_por_mi: boolean; 
  receptor_leyo_mi_mensaje: boolean; 
}

const ChatsListPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "no_leidos" | "leidos">("todos");
  const [cargando, setCargando] = useState(true);

  // Función inteligente para formatear la fecha/hora estilo WhatsApp
  const formatearFechaMensaje = (fechaStr: string): string => {
    if (!fechaStr) return "";
    
    const fechaMsj = new Date(fechaStr);
    const ahora = new Date();
    
    // Resetear horas para comparar días exactos
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    const fechaMsjCeroHoras = new Date(fechaMsj.getFullYear(), fechaMsj.getMonth(), fechaMsj.getDate());

    // 1. Si es HOY: mostramos la hora
    if (fechaMsjCeroHoras.getTime() === hoy.getTime()) {
      return fechaMsj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    // 2. Si fue AYER: "Ayer"
    if (fechaMsjCeroHoras.getTime() === ayer.getTime()) {
      return "Ayer";
    }

    // 3. Si fue en la última semana (menos de 7 días atrás)
    const diferenciaDias = Math.floor((hoy.getTime() - fechaMsjCeroHoras.getTime()) / (1000 * 60 * 60 * 24));
    if (diferenciaDias < 7) {
      const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      return diasSemana[fechaMsj.getDay()];
    }

    // 4. Si es más viejo: fecha completa corta (dd/mm/aaaa)
    return fechaMsj.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
  };

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

            // Usamos la nueva función inteligente de formateo
            const tiempoFormateado = formatearFechaMensaje(sala.ultimo_mensaje_fecha);
            const sinLeerCount = parseInt(sala.mensajes_sin_leer || "0", 10);

            const enviadoPorMi = 
              sala.ultimo_mensaje_enviado_por_mi === true || 
              sala.ultimo_mensaje_enviado_por_mi === 1 ||
              sala.enviado_por_mi === true ||
              sala.enviado_por_mi === 1 ||
              (sinLeerCount === 0 && sala.ultimo_mensaje && sala.ultimo_mensaje !== "Sin mensajes");

            const receptorLeyoMiMensaje = enviadoPorMi && sinLeerCount === 0;

            return {
              sala_id: sala.sala_id,
              usuario_nombre: nombreCompleto,
              usuario_avatar: avatarUrl,
              ultimo_mensaje: sala.ultimo_mensaje || "Sin mensajes",
              ultimo_mensaje_tiempo: tiempoFormateado,
              leido: sinLeerCount === 0,
              enviado_por_mi: !!enviadoPorMi, 
              receptor_leyo_mi_mensaje: !!receptorLeyoMiMensaje
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

    fetchSalas();
  }, [filter]);

  const chatsSeguros = Array.isArray(chats) ? chats : [];
  const filteredChats = chatsSeguros.filter((chat) =>
    chat?.usuario_nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chats_container_page">
      <Header />

      <main className="chats_content">
        <h1 className="chats_main_title">Mensajes</h1>

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
                      {chat.enviado_por_mi ? (
                        <span className={`chats_list_double_check ${chat.receptor_leyo_mi_mensaje ? "read" : "unread"}`}>
                          ✓✓
                        </span>
                      ) : (
                        !chat.leido && <div className="chats_unread_dot" />
                      )}
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