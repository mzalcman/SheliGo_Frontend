import "./object_card.css";

import { MapPin } from "lucide-react";

interface ObjectCardProps {
  image: string;
  title: string;
  location: string;
  status: string;
}

const ObjectCard = ({
  image,
  title,
  location,
  status,
}: ObjectCardProps) => {


    /*- Si el estado es "encontrado" se agrega la clase "found" 
    Si no --> se agrega la clase "lost"
 Esto permite cambiar el color desde CSS automáticamente */
  const statusClass =
    status.toLowerCase() === "encontrado"
      ? "found"
      : "lost";

  return (
    <div className="object_card">

      <div className="object_card_image_container">

        <img
          src={image}
          alt={title}
          className="object_card_image"
        />

        <div className={`object_card_status ${statusClass}`}>
          {status}
        </div>

      </div>

      <div className="object_card_content">

        <h3 className="object_card_title">
          {title}
        </h3>

        <div className="object_card_location">
          <MapPin size={14} />
          <span>{location}</span>
        </div>

      </div>

    </div>
  );
};

export default ObjectCard;