import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "../../services/api";
import { get_api_error_message } from "../../services/api_error";

interface ClaimButtonProps {
  otroUsuarioId: string;     
  usuarioNombre?: string;    
  usuarioAvatar?: string;     
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ 
  otroUsuarioId, 
  usuarioNombre = "Usuario", 
  usuarioAvatar = "" 
}) => {
  const navigate = useNavigate();
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState("");

  const handleReclamar = async () => {
    if (abriendo) return;
    setAbriendo(true);
    setError("");
    try {
      const response = await api.post("/chat/salas", {
        otroUsuarioId: otroUsuarioId
      });

      const jsonResponse = response.data;

      if (jsonResponse && jsonResponse.status === "success" && jsonResponse.data?.sala_id) {
        const salaId = jsonResponse.data.sala_id;

        navigate(`/chat/${salaId}`, {
          state: {
            usuario: {
              sala_id: salaId,
              usuario_nombre: usuarioNombre,
              usuario_avatar: usuarioAvatar
            }
          }
        });
      } else {
        setError("No se pudo abrir el chat. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError(get_api_error_message(err, "No se pudo abrir el chat. Inténtalo de nuevo."));
    } finally {
      setAbriendo(false);
    }
  };

  return (
    <>
      <button className="btn btn_primary btn_lg btn_block" onClick={handleReclamar} disabled={abriendo}>
        <MessageCircle size={20} strokeWidth={2.2} />
        {abriendo ? "Abriendo chat..." : "Reclamar ahora"}
      </button>
      {error && <p className="form_alert form_alert_error">{error}</p>}
    </>
  );
};

export default ClaimButton;