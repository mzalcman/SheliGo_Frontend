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
          usuario_id: otroUsuarioId 
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Si el backend te devuelve la sala creada o recuperada
        if (data && data.sala_id) {
          // Redirigimos al chat pasando la información por el state de React Router
          navigate(`/chat/${data.sala_id}`, {
            state: {
              usuario: {
                sala_id: data.sala_id,
                usuario_nombre: usuarioNombre,
                usuario_avatar: usuarioAvatar
              }
            }
          });
        } else {
          console.error("El backend no devolvió el ID de la sala esperado:", data);
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