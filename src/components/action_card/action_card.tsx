import "./action_card.css";

import { Search } from "lucide-react";

interface ActionCardProps {
  title: string;
  subtitle: string;
  background_color: string;
  show_icon?: boolean;
}

const ActionCard = ({
  title,
  subtitle,
  background_color,
  show_icon,
}: ActionCardProps) => {

  return (
    <button
      className="action_card"
      style={{
        backgroundColor: background_color,
      }}
    >
      <div className="action_card_content">
        <h2 className="action_card_title">
          {title}
        </h2>
        <p className="action_card_subtitle">
          {subtitle}
        </p>

      </div>

      {/* Icono watermark */}
      {show_icon && (
        <Search
          className="action_card_icon"
          size={95}
          strokeWidth={2}
        />
      )}
    </button>
  );
};
export default ActionCard;