import "./action_card.css";

import { Search, CheckCircle } from "lucide-react";

interface ActionCardProps {
  title: string;
  subtitle: string;
  background_color: string;

  // Tipo de icono
  icon: "search" | "check";
}
const ActionCard = ({
  title,
  subtitle,
  background_color,
  icon,
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

      {/* 
        Si icon es "check" mostramos el check Sino mostramos la lupa
      */}
      {icon === "check" ? (
        <CheckCircle
          className="action_card_icon"
          size={95}
          strokeWidth={2}
        />
      ) : (
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