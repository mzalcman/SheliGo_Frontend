import "./object_card.css";
import { MapPin } from "lucide-react";
import PublicationStatus
from "../publication_status/publication_status";
import { useNavigate } from "react-router-dom";

interface ObjectCardProps {
  id:string;
  image: string;
  title: string;
  location: string;
  status: string;
}

const ObjectCard = ({
  id,
  image,
  title,
  location,
  status,
}: ObjectCardProps) => {
  
const navigate = useNavigate();
  return (
    <div
  className="object_card" onClick={() => navigate(`/publicacion/${id}`)}>

      <div className="object_card_image_container">

        <img
          src={image}
          alt={title}
          className="object_card_image"
        />

        <div className="object_card_status">
            <PublicationStatus status={status}small={true} />
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