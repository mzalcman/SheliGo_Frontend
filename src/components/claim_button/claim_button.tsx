import React from "react";
import { useNavigate } from "react-router-dom";
import "./claim_button.css";
import { api } from "../../services/api";

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

  const handleReclamar = async () => {
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
        console.error("El backend no devolvió el ID de la sala esperado:", jsonResponse);
      }
    } catch (error) {
      console.error("Error al intentar abrir o crear la sala de chat:", error);
    }
  };

  return (
    <button className="claim_button" onClick={handleReclamar}>
      Reclamar ahora
    </button>
  );
};

export default ClaimButton;