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
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "no_leidos" | "leidos">("todos");

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/chat/salas", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        } else {
          setChats([
            {
              sala_id: "sala_juana_123",
              usuario_nombre: "Juana Perez",
              usuario_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
              ultimo_mensaje: "Encontraste una mochila?",
              ultimo_mensaje_tiempo: "HACE 2 MIN",
              leido: false,
              enviado_por_mi: false
            },
            {
              sala_id: "sala_pilar_456",
              usuario_nombre: "Pilar Garcia",
              usuario_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
              ultimo_mensaje: "Dale, vamos viendo en la s...",
              ultimo_mensaje_tiempo: "14:32",
              leido: true,
              enviado_por_mi: true
            },
            {
              sala_id: "sala_mario_789",
              usuario_nombre: "Mario Cohen",
              usuario_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
              ultimo_mensaje: "No hace falta, yo puedo ir ...",
              ultimo_mensaje_tiempo: "AYER",
              leido: true,
              enviado_por_mi: false
            },
            {
              sala_id: "sala_andres_012",
              usuario_nombre: "Andres Gomez",
              usuario_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
              ultimo_mensaje: "Si, estoy a 5 minutos de ese...",
              ultimo_mensaje_tiempo: "20/01",
              leido: false,
              enviado_por_mi: false
            }
          ]);
        }
      } catch (error) {
        console.error("Error al traer salas de chat:", error);
      }
    };

    fetchSalas();
  }, []);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.usuario_nombre.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "no_leidos") return !chat.leido;
    if (filter === "leidos") return chat.leido;
    return true;
  });

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
          {filteredChats.map((chat) => (
            <div 
              key={chat.sala_id} 
              className={`chats_item_card ${!chat.leido ? "unread_bg" : ""}`}
              onClick={() => navigate(`/chat/${chat.sala_id}`, { state: { usuario: chat } })}
            >
              <img src={chat.usuario_avatar} alt={chat.usuario_nombre} className="chats_avatar" />
              
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
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatsListPage;