import "./object_card.css";
import { MapPin, Calendar } from "lucide-react";
import PublicationStatus from "../publication_status/publication_status";
import { useNavigate } from "react-router-dom";

interface ObjectCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  status: string;
  estado?: string;
  createdAt?: string | Date;
}

const ObjectCard = ({
  id,
  image,
  title,
  location,
  status,
  estado,
  createdAt,
}: ObjectCardProps) => {
  const navigate = useNavigate();

  // Filtro inteligente: si la imagen viene con el link roto "placeholder-bege.jpg" o vacía,
  // la cambiamos al vuelo por tu propia imagen local para que no tire error en la consola.
  const finalImage = 
    !image || image.includes("placeholder-bege.jpg") 
      ? "/obj_predeterminada.png" 
      : image;

  const formatDate = (dateValue?: string | Date) => {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
    }).format(date);
  };

  const formattedDate = formatDate(createdAt);

  return (
    <div
      className="object_card"
      onClick={() => navigate(`/publicacion/${id}`)}
    >
      <div className="object_card_image_container">
        <img
          src={finalImage}
          alt={title}
          className="object_card_image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/obj_predeterminada.png";
          }}
        />

        <div className="object_card_status">
          <PublicationStatus status={status} estado={estado} small={true} />
        </div>
      </div>

      <div className="object_card_content">
        <h3 className="object_card_title">
          {title}
        </h3>

        <div className="object_card_location">
          <MapPin size={15} strokeWidth={2} />
          <span>{location}</span>
        </div>

        {formattedDate && (
          <div className="object_card_date">
            <Calendar size={15} strokeWidth={2} />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectCard;