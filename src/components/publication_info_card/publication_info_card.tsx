import "./publication_info_card.css";
import type {LucideIcon,} from "lucide-react";

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
  return (
    <div className="publication_info_card">

      <div
        className="publication_info_icon"
        style={{
          backgroundColor:
            icon_background
        }}>
        <Icon
          size={28}
          strokeWidth={2.3}
        />
      </div>

      <div className="publication_info_content">
        <span className="publication_info_title">
          {title}
        </span>

        <span className="publication_info_main">
          {main_text}
        </span>
        {
          secondary_text && (
            <span
              className="publication_info_secondary">
              {secondary_text}
            </span>
          )
        }
      </div>
    </div>

  );
};
export default PublicationInfoCard;