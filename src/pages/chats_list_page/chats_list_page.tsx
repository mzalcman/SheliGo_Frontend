import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./chats_list_page.css";

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
  const [chats, setChats] = useState<ChatRoom[]>([]); // Aseguramos array al inicio
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
          const data = await response.json();
          
          // 🔍 DEBUG: Esto te va a mostrar en la consola qué te está mandando el backend exacto
          console.log("ESTO LLEGA DEL BACKEND:", data);

          // BLINDAJE: Analizamos qué estructura nos mandó el servidor
          if (Array.isArray(data)) {
            // Caso A: El back manda una lista directa: [ {...}, {...} ]
            setChats(data);
          } else if (data && typeof data === "object" && Array.isArray(data.salas)) {
            // Caso B: El back manda un objeto con una propiedad: { salas: [ ... ] }
            setChats(data.salas);
          } else if (data && typeof data === "object" && Array.isArray(data.data)) {
            // Caso C: El back manda un objeto con 'data': { data: [ ... ] }
            setChats(data.data);
          } else {
            // Fallback: Si no es nada de lo anterior, evitamos que se rompa asignando array vacío
            console.warn("La API respondió pero no se reconoció un formato de array válido:", data);
            setChats([]);
          }
        } else {
          console.error("Error en la respuesta del servidor al traer salas (HTTP:", response.status, ")");
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

  // 🛡️ SEGUNDO BLINDAJE: Si por algún motivo 'chats' mutó a otra cosa, forzamos un array para el renderizado
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
                  src={chat.usuario_avatar || "/default-user.png"} 
                  alt={chat.usuario_nombre} 
                  className="chats_avatar" 
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