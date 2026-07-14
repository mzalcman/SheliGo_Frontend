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
  const { user } = useAuthContext(); 
  const chatInfo = location.state?.usuario;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!salaId) return;

    const cargarHistorial = async () => {
      try {
        setCargandoHistorial(true);
        const token = localStorage.getItem("token");
        
        const response = await fetch(`http://localhost:3000/chat/salas/${salaId}/mensajes`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error("Error al obtener los mensajes de la API");
        }
      } catch (error) {
        console.error("Error de red al cargar el historial:", error);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();

    // ESCUCHAR EN TIEMPO REAL (INSERTs y DELETEs)
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
          console.log("Nuevo mensaje en tiempo real:", nuevoMensaje);
          
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === nuevoMensaje.id)) return prev;
            return [...prev, nuevoMensaje];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "mensajes"
        },
        (payload) => {
          const mensajeEliminadoId = payload.old.id;
          console.log("Mensaje eliminado en tiempo real:", mensajeEliminadoId);
          
          setMessages((prev) => prev.filter((msg) => msg.id !== mensajeEliminadoId));
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

  // ENVIAR MENSAJE A TRAVÉS DE LA API DE NODE (POST /api/chat/mensaje)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !salaId) return;

    const contenidoMensaje = inputValue;
    setInputValue(""); 

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/chat/mensaje", {
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
        console.error("Error enviando el mensaje al servidor de Node");
      }
    } catch (error) {
      console.error("Error de red al intentar enviar el mensaje:", error);
    }
  };

  // ELIMINAR MENSAJE (DELETE /api/chat/mensaje/:id)
  const handleBorrarMensaje = async (mensajeId: string, emisorId: string) => {
    if (emisorId !== user?.id) return;

    const quiereBorrar = window.confirm("¿Deseas eliminar este mensaje para todos?");
    if (!quiereBorrar) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/chat/mensaje/${mensajeId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("No se pudo eliminar el mensaje en el backend");
      }
    } catch (error) {
      console.error("Error de red al intentar eliminar mensaje:", error);
    }
  };

  const formatearHora = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="room_container_page">
      {/* Header del Chat */}
      <header className="room_header">
        <button className="room_back_btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={26} color="#ff6f00" strokeWidth={2.5} />
        </button>
        <img 
          src={chatInfo?.usuario_avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} 
          alt="Avatar" 
          className="room_header_avatar" 
        />
        <span className="room_header_name">{chatInfo?.usuario_nombre || "Chat"}</span>
      </header>

      {/* Área de Mensajes */}
      <main className="room_chat_area">
        <div className="room_date_tag">
          <span>CHAT</span>
        </div>

        <div className="room_messages_list">
          {cargandoHistorial ? (
            <p className="room_delete_hint">Cargando mensajes anteriores...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const esMio = msg.emisor_id === user?.id;
              return (
                <div 
                  key={msg.id} 
                  className={`room_bubble_wrapper ${esMio ? "mine" : "theirs"}`}
                  onContextMenu={(e) => {
                    e.preventDefault(); 
                    handleBorrarMensaje(msg.id, msg.emisor_id);
                  }}
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
            })
          ) : (
            <p className="room_delete_hint" style={{ marginTop: "20px" }}>
              No hay mensajes aún en esta conversación. ¡Saludá! 👋
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <p className="room_delete_hint">MANTÉN PRESIONADO EN TU BURBUJA PARA ELIMINAR UN MENSAJE</p>
      </main>

      {/* Formulario de Entrada */}
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