import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, AlertCircle, Trash2, CheckCheck } from "lucide-react";
import { useAuthContext } from "../../contexts/auth_context";
import { api } from "../../services/api";
import Modal from "../../components/modal/modal";
import "./chat_room_page.css";
import { getImageUrl } from "../../utils/get_image_url";
import { ACCEPTED_IMAGE_INPUT, get_image_error } from "../../utils/image_rules";
import { get_api_error_message } from "../../services/api_error";

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

const INTERVALO_ACTUALIZACION_MS = 3000;
// Mismo máximo que el backend (mensajes.contenido es varchar(256))
const MAX_CARACTERES_MENSAJE = 256;

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
  const versionMensajesRef = useRef(0);

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState<string | null>(null);
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [eliminando, setEliminando] = useState(false);

  // Agrega el mensaje que devolvió el backend sin esperar a la próxima actualización
  const agregarMensajePropio = (mensaje?: Message) => {
    if (!mensaje?.id) return;
    versionMensajesRef.current += 1;
    setMessages((prev) => (prev.some((msg) => msg.id === mensaje.id) ? prev : [...prev, mensaje]));
  };

  /*
  Mensajes nuevos, leídos y borrados: se consulta al backend cada pocos segundos.
  No se usa Realtime de Supabase porque el cliente del navegador usa la clave
  pública (anon) y no la sesión de SheliGo: para recibir eventos habría que
  dejar la tabla mensajes legible para cualquiera. El backend sí valida que el
  usuario sea parte de la sala (y al leer marca los mensajes como leídos).
  */
  useEffect(() => {
    if (!salaId) return;
    let activo = true;

    const cargarMensajes = async (primeraCarga: boolean) => {
      // Si mientras tanto se envió o borró un mensaje, esta respuesta quedó vieja
      const version = versionMensajesRef.current;
      try {
        const response = await api.get(`/chat/salas/${salaId}/mensajes`);
        const resJson = response.data;
        if (activo && version === versionMensajesRef.current && resJson?.status === "success" && Array.isArray(resJson.data)) {
          setMessages(resJson.data);
        }
      } catch (error) {
        if (primeraCarga) console.error("Error al cargar el historial:", error);
      } finally {
        if (activo && primeraCarga) setCargandoHistorial(false);
      }
    };

    cargarMensajes(true);

    const intervalo = setInterval(() => {
      if (!document.hidden) cargarMensajes(false);
    }, INTERVALO_ACTUALIZACION_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
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
      const response = await api.post("/chat/mensaje", {
        sala_id: salaId,
        contenido: contenidoMensaje
      });
      agregarMensajePropio(response.data?.data);
    } catch (error) {
      // Se devuelve el texto al input para no perder lo que se escribió
      setInputValue((actual) => actual || contenidoMensaje);
      const errorMsg = get_api_error_message(error, "No se pudo enviar el mensaje.");
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
    const imageError = get_image_error(file);
    if (imageError) {
      showErrorModal(imageError);
      return;
    }
    const formData = new FormData();
    formData.append("sala_id", salaId);
    formData.append("foto", file);

    setEnviando(true);

    try {
      const response = await api.post("/chat/mensaje", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      agregarMensajePropio(response.data?.data);
    } catch (error) {
      const errorMsg = get_api_error_message(error, "Error al subir la imagen.");
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
    if (!mensajeAEliminar || eliminando) return;

    setEliminando(true);
    try {
      await api.delete(`/chat/mensaje/${mensajeAEliminar}`);
      versionMensajesRef.current += 1;
      setMessages((prev) => prev.filter((msg) => msg.id !== mensajeAEliminar));
    } catch (error) {
      const errorMsg = get_api_error_message(error, "No se pudo eliminar el mensaje.");
      showErrorModal(errorMsg);
    } finally {
      setEliminando(false);
      setMostrarModalEliminar(false);
      setMensajeAEliminar(null);
    }
  };

  const formatearHora = (isoString: string) => {
    if (!isoString) return "";
    const fecha = new Date(isoString);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  };

  return (
    <div className="room_container_page">
      <header className="room_header">
        <div className="room_header_inner">
          <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={20} strokeWidth={2.2} />
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
        </div>
      </header>

      <main className="room_chat_area">
        <div className="room_messages_list">
          <div className="room_date_tag">
            <span>CHAT</span>
          </div>

          {cargandoHistorial ? (
            <div className="room_status_hint">
              <div className="spinner" />
              <p>Cargando mensajes anteriores...</p>
            </div>
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
                      <span
                        className={`room_double_check ${estaLeido ? "read" : "unread"}`}
                        aria-label={estaLeido ? "Leído" : "Enviado"}
                      >
                        <CheckCheck size={15} strokeWidth={2.4} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="room_status_hint">
              No hay mensajes aún en esta conversación.
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        accept={ACCEPTED_IMAGE_INPUT}
        hidden
        onChange={handleFileChange}
      />

      <form className="room_input_bar" onSubmit={handleSendMessage}>
        <div className="room_input_inner">
          <div className="room_input_wrapper">
            <input
              type="text"
              placeholder="Escribe aquí..."
              maxLength={MAX_CARACTERES_MENSAJE}
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
              aria-label="Adjuntar foto"
            >
              <Paperclip size={20} />
            </button>
          </div>
          <button type="submit" className="room_send_btn" disabled={enviando} aria-label="Enviar">
            {enviando ? <span className="spinner_small" /> : <Send size={19} strokeWidth={2.2} />}
          </button>
        </div>
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
        confirmTone="danger"
        icon={<Trash2 size={26} strokeWidth={2.2} />}
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
        icon={<AlertCircle size={26} strokeWidth={2.2} />}
        confirmText="Entendido"
      />
    </div>
  );
};

export default ChatRoomPage;