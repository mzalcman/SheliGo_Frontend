import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useAuthContext } from "../../contexts/auth_context";
import { supabase } from "../../services/supabase";
import "./chat_room_page.css";
import { getImageUrl } from "../../utils/get_image_url";

interface Message {
  id: string;
  sala_id: string;
  contenido: string;
  emisor_id: string;
  created_at: string;
  leido?: boolean | number | string; 
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

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState<string | null>(null);

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
          const resJson = await response.json();
          if (resJson && resJson.status === "success" && Array.isArray(resJson.data)) {
            setMessages(resJson.data);
          }
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

          // Si el mensaje entrante no es tuyo, marcamos que el último emisor es el "otro"
          if (nuevoMensaje.emisor_id !== user?.id) {
            localStorage.setItem(`ultimo_emisor_${salaId}`, "otro");
          }

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === nuevoMensaje.id)) return prev;
            return [...prev, nuevoMensaje];
          });
        }
      )
      // Escucha cambios de UPDATE en tiempo real (cuando el receptor abre el chat y los mensajes se marcan como leídos)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mensajes",
          filter: `sala_id=eq.${salaId}`
        },
        (payload) => {
          const mensajeActualizado = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === mensajeActualizado.id ? mensajeActualizado : msg))
          );
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

  // ENVIAR MENSAJE A TRAVÉS DE LA API DE NODE (POST /chat/mensaje)
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

      if (response.ok) {
        // Como mandaste vos el mensaje con éxito, dejamos que el último emisor fue "yo"
        localStorage.setItem(`ultimo_emisor_${salaId}`, "yo");
      } else {
        console.error("Error enviando el mensaje al servidor de Node");
      }
    } catch (error) {
      console.error("Error de red al intentar enviar el mensaje:", error);
    }
  };

  // PASO 1: Dispara la apertura del modal en vez de borrar directamente
  const abrirModalConfirmacion = (mensajeId: string, emisorId: string) => {
    if (emisorId !== user?.id) return; // Seguridad: Evitar que intentes borrar un mensaje ajeno
    setMensajeAEliminar(mensajeId);
    setMostrarModal(true);
  };

  // PASO 2: Se ejecuta al hacer clic en "Eliminar" dentro del modal
  const handleBorrarMensajeConfirmado = async () => {
    if (!mensajeAEliminar) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/chat/mensaje/${mensajeAEliminar}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== mensajeAEliminar));
        console.log("Mensaje eliminado con éxito");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("No se pudo eliminar el mensaje en el backend:", errorData.message || response.statusText);
        alert("Hubo un problema al intentar eliminar el mensaje.");
      }
    } catch (error) {
      console.error("Error de red al intentar eliminar mensaje:", error);
      alert("Error de conexión al eliminar el mensaje.");
    } finally {
      // Limpiamos los estados del modal
      setMostrarModal(false);
      setMensajeAEliminar(null);
    }
  };

  const formatearHora = (isoString: string) => {
    if (!isoString) return "";
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
          src={
            chatInfo?.usuario_avatar || chatInfo?.avatar || chatInfo?.foto
              ? getImageUrl(chatInfo.usuario_avatar || chatInfo.avatar || chatInfo.foto)
              : "/user_predeterminada.png"
          }
          alt="Avatar"
          className="room_header_avatar"
          onError={(event) => {
            event.currentTarget.src = "/user_predeterminada.png";
          }}
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

              const estaLeido =
                msg.leido === true ||
                msg.leido === 1 ||
                msg.leido === "1" ||
                msg.leido === "true";

              return (
                <div
                  key={msg.id}
                  className={`room_bubble_wrapper ${esMio ? "mine" : "theirs"}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Modal 
                    abrirModalConfirmacion(msg.id, msg.emisor_id);
                  }}
                >
                  <div className="room_bubble">
                    <p className="room_bubble_text">{msg.contenido}</p>
                  </div>
                  <div className="room_bubble_meta">
                    <span className="room_bubble_time">{formatearHora(msg.created_at)}</span>
                    {esMio && (
                      <span className={`room_double_check ${estaLeido ? "read" : "unread"}`}>
                        ✓✓
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="room_delete_hint" style={{ marginTop: "20px" }}>
              No hay mensajes aún en esta conversación. ¡Saludá!
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Formulario */}
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

      {/* MODAL DE CONFIRMACIÓN INTEGRADO*/}
      {mostrarModal && (
        <div className="room_modal_overlay" onClick={() => { setMostrarModal(false); setMensajeAEliminar(null); }}>
          <div className="room_modal_card" onClick={(e) => e.stopPropagation()}>
            <h3 className="room_modal_title">¿Eliminar mensaje?</h3>
            <p className="room_modal_text">
              Esto eliminará el mensaje para todos en la conversación de forma permanente.
            </p>
            <div className="room_modal_actions">
              <button
                type="button"
                className="room_modal_btn cancel"
                onClick={() => { setMostrarModal(false); setMensajeAEliminar(null); }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="room_modal_btn confirm"
                onClick={handleBorrarMensajeConfirmado}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomPage;