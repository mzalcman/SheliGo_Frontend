import "./publication_info_card.css";
import type { LucideIcon } from "lucide-react";

interface PublicationInfoCardProps {
  title: string;
  main_text: string;
  secondary_text?: string;
  icon: LucideIcon;
  icon_background: string;
}

const PublicationInfoCard = ({
  title,
  main_text,
  secondary_text,
  icon: Icon,
  icon_background,
}: PublicationInfoCardProps) => {
  // Solo visual: sobre amarillo el icono va oscuro, sobre naranja va blanco
  const is_light_background = icon_background.toUpperCase() === "#FFC107";

  return (
    <div className="publication_info_card">
      <div
        className={`publication_info_icon ${is_light_background ? "on_light" : "on_dark"}`}
        style={{ backgroundColor: icon_background }}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>

      <div className="publication_info_content">
        <span className="publication_info_title">
          {title}
        </span>

        <span className="publication_info_main">
          {main_text}
        </span>
        {secondary_text && (
          <span className="publication_info_secondary">
            {secondary_text}
          </span>
        )}
      </div>
    </div>
  );
};
export default PublicationInfoCard;
