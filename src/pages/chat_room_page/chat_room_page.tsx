import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useAuthContext } from "../../contexts/auth_context"; 
import { supabase } from "../../services/supabase";
import "./chat_room_page.css";

interface Message {
  id: string;
  sala_id: string;
  contenido: string;
  emisor_id: string;
  creado_at: string;
}

const ChatRoomPage = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext(); // Obtenemos el usuario activo
  const chatInfo = location.state?.usuario; // Info del receptor (avatar y nombre)

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1️⃣ Cargar historial previo de Node + Suscribir a Supabase Realtime
  useEffect(() => {
    if (!salaId) return;

    // Fetch del historial previo a tu API de Node
    const cargarHistorial = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/chat/mensajes/${salaId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          setMessages([
            {
              id: "msg_1",
              sala_id: salaId,
              contenido: "Encontraste una mochila? de color gris con varias cosas adentro?",
              emisor_id: "otro_usuario_id",
              creado_at: new Date(new Date().setHours(10, 15)).toISOString()
            },
            {
              id: "msg_2",
              sala_id: salaId,
              contenido: "Holaaa, sisi encontré eso, tenia una botella, unas zapatillas, unas galletitas y algo más",
              emisor_id: user?.id || "",
              creado_at: new Date(new Date().setHours(10, 32)).toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    };

    cargarHistorial();

    // ESCUCHAR EN TIEMPO REAL (Instrucciones del Back)
    const canal = supabase
      .channel(`sala_${salaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `sala_id=eq.${salaId}`
        },
        (payload) => {
          const nuevoMensaje = payload.new as Message;
          console.log("Nuevo mensaje recibido en vivo:", nuevoMensaje);
          
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === nuevoMensaje.id)) return prev;
            return [...prev, nuevoMensaje];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [salaId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ENVIAR MENSAJE 
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !salaId) return;

    const contenidoMensaje = inputValue;
    setInputValue(""); 

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/chat/mensaje", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          sala_id: salaId,
          contenido: contenidoMensaje
        })
      });

      if (!response.ok) {
        console.error("Error enviando el mensaje al backend de Node");
      }
    } catch (error) {
      console.error("Fallo de red al enviar mensaje:", error);
    }
  };

  const formatearHora = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="room_container_page">
      {/* Header específico del Chat */}
      <header className="room_header">
        <button className="room_back_btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={26} color="#ff6f00" strokeWidth={2.5} />
        </button>
        <img 
          src={chatInfo?.usuario_avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} 
          alt="Avatar" 
          className="room_header_avatar" 
        />
        <span className="room_header_name">{chatInfo?.usuario_nombre || "Juana Perez"}</span>
      </header>

      {/* Área de Mensajes */}
      <main className="room_chat_area">
        <div className="room_date_tag">
          <span>HOY</span>
        </div>

        <div className="room_messages_list">
          {messages.map((msg) => {
            const esMio = msg.emisor_id === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`room_bubble_wrapper ${esMio ? "mine" : "theirs"}`}
              >
                <div className="room_bubble">
                  <p className="room_bubble_text">{msg.contenido}</p>
                </div>
                <div className="room_bubble_meta">
                  <span className="room_bubble_time">{formatearHora(msg.creado_at)}</span>
                  {esMio && <span className="room_double_check">✓✓</span>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <p className="room_delete_hint">MANTÉN PRESIONADO PARA ELIMINAR UN MENSAJE</p>
      </main>

      <form className="room_input_bar" onSubmit={handleSendMessage}>
        <div className="room_input_wrapper">
          <input
            type="text"
            placeholder="Escribe aquí..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="room_text_input"
          />
          <button type="button" className="room_attachment_btn">
            <Paperclip size={22} color="#6e6e6e" />
          </button>
        </div>
        <button type="submit" className="room_send_btn">
          <Send size={20} color="#ffffff" strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoomPage;