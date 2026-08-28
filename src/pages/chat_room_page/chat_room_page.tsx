import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, AlertCircle, Trash2 } from "lucide-react";
import { useAuthContext } from "../../contexts/auth_context";
import { supabase } from "../../services/supabase";
import { api } from "../../services/api";
import Modal from "../../components/modal/modal";
import "./chat_room_page.css";
import { getImageUrl } from "../../utils/get_image_url";

interface Message {
  id: string;
  sala_id: string;
  contenido: string;
  contenido_url?: string;
  emisor_id: string;
  created_at: string;
  leido?: boolean | number | string; 
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

const ChatRoomPage = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const chatInfo = location.state?.usuario;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState<string | null>(null);
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (!salaId) return;

    const cargarHistorial = async () => {
      try {
        setCargandoHistorial(true);
        const response = await api.get(`/chat/salas/${salaId}/mensajes`);
        const resJson = response.data;

        if (resJson && resJson.status === "success" && Array.isArray(resJson.data)) {
          setMessages(resJson.data);
        }
      } catch (error) {
        console.error("Error al cargar el historial:", error);
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
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === nuevoMensaje.id)) return prev;
            return [...prev, nuevoMensaje];
          });
        }
      )
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
          setMessages((prev) => prev.filter((msg) => msg.id !== mensajeEliminadoId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [salaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const solicitarEliminacion = (mensajeId: string, emisorId: string) => {
    if (emisorId !== user?.id) return;
    setMensajeAEliminar(mensajeId);
    setMostrarModalEliminar(true);
  };

  const handlePressStart = (e: React.SyntheticEvent, mensajeId: string, emisorId: string) => {
    if (emisorId !== user?.id) return;

    if ('button' in e && (e as React.MouseEvent).button === 2) {
      solicitarEliminacion(mensajeId, emisorId);
      return;
    }

    timerRef.current = setTimeout(() => {
      solicitarEliminacion(mensajeId, emisorId);
    }, 500);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !salaId || enviando) return;

    const contenidoMensaje = inputValue;
    setInputValue("");
    setEnviando(true);

    try {
      await api.post("/chat/mensaje", {
        sala_id: salaId,
        contenido: contenidoMensaje
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "No se pudo enviar el mensaje.";
      showErrorModal(errorMsg);
    } finally {
      setEnviando(false);
    }
  };

  // SUBIR FOTO
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !salaId) return;

    e.target.value = "";
    const formData = new FormData();
    formData.append("sala_id", salaId);
    formData.append("foto", file);

    setEnviando(true);

    try {
      await api.post("/chat/mensaje", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al subir la imagen.";
      showErrorModal(errorMsg);
    } finally {
      setEnviando(false);
    }
  };

  const showErrorModal = (msg: string) => {
    setMensajeError(msg);
    setMostrarModalError(true);
  };

  // CONFIRMAR BORRADO
  const handleBorrarMensajeConfirmado = async () => {
    if (!mensajeAEliminar) return;

    try {
      await api.delete(`/chat/mensaje/${mensajeAEliminar}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== mensajeAEliminar));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "No se pudo eliminar el mensaje.";
      showErrorModal(errorMsg);
    } finally {
      setMostrarModalEliminar(false);
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
              const esFoto = esRutaImagen(msg.contenido);
              const estaLeido = msg.leido === true || msg.leido === 1 || msg.leido === "1" || msg.leido === "true";

              return (
                <div
                  key={msg.id}
                  className={`room_bubble_wrapper ${esMio ? "mine" : "theirs"}`}
                  onTouchStart={(e) => handlePressStart(e, msg.id, msg.emisor_id)}
                  onTouchEnd={handlePressEnd}
                  onTouchMove={handlePressEnd}
                  onMouseDown={(e) => handlePressStart(e, msg.id, msg.emisor_id)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (esMio) {
                      handlePressEnd();
                      solicitarEliminacion(msg.id, msg.emisor_id);
                    }
                  }}
                >
                  <div className={`room_bubble ${esFoto ? "image_bubble" : ""}`}>
                    {esFoto ? (
                      <img
                        src={msg.contenido_url || getImageUrl(msg.contenido)}
                        alt="Imagen enviada"
                        className="room_image_content"
                      />
                    ) : (
                      <p className="room_bubble_text">{msg.contenido}</p>
                    )}
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
              No hay mensajes aún en esta conversación.
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <form className="room_input_bar" onSubmit={handleSendMessage}>
        <div className="room_input_wrapper">
          <input
            type="text"
            placeholder="Escribe aquí..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="room_text_input"
            disabled={enviando}
          />
          <button
            type="button"
            className="room_attachment_btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviando}
          >
            <Paperclip size={22} color="#6e6e6e" />
          </button>
        </div>
        <button type="submit" className="room_send_btn" disabled={enviando}>
          <Send size={20} color="#ffffff" strokeWidth={2.5} />
        </button>
      </form>

      <Modal
        isOpen={mostrarModalEliminar}
        onClose={() => {
          setMostrarModalEliminar(false);
          setMensajeAEliminar(null);
        }}
        title="¿Eliminar mensaje?"
        description="Esto eliminará el mensaje de forma permanente para todos los integrantes de este chat"
        variant="confirm"
        icon={<Trash2 size={28} color="#d32f2f" />}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleBorrarMensajeConfirmado}
      />

      <Modal
        isOpen={mostrarModalError}
        onClose={() => setMostrarModalError(false)}
        title="Ocurrió un problema"
        description={mensajeError}
        variant="error"
        icon={<AlertCircle size={28} color="#d32f2f" />}
        confirmText="Entendido"
      />
    </div>
  );
};

export default ChatRoomPage;