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

  return (
    <div className="object_card">

      <div className="object_card_image_container">

        <img
          src={image}
          alt={title}
          className="object_card_image"
        />

        <div className="object_card_status">
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