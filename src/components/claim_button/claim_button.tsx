import React from "react";
import { useNavigate } from "react-router-dom";
import "./claim_button.css";

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
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:3000/chat/salas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          otroUsuarioId: otroUsuarioId 
        })
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        
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
      } else {
        console.error("Error al intentar abrir o crear la sala de chat (HTTP:", response.status, ")");
      }
    } catch (error) {
      console.error("Error de red al intentar reclamar:", error);
    }
  };

  return (
    <button className="claim_button" onClick={handleReclamar}>
      Reclamar ahora
    </button>
  );
};

export default ClaimButton;