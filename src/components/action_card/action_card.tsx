import "./action_card.css";
import { Search, CheckCircle, ArrowRight } from "lucide-react";

interface ActionCardProps {
  title: string;
  subtitle: string;
  background_color: string;
  icon: string;
  onClick?: () => void;
}
const ActionCard = ({
  title,
  subtitle,
  background_color,
  icon,
  onClick,
}: ActionCardProps) => {
  // Solo visual: el amarillo lleva texto oscuro y el naranja texto claro
  const is_light_background = background_color.toUpperCase() === "#FFC107";
  const Icon = icon === "check" ? CheckCircle : Search;

  return (
    <button
      className={`action_card ${is_light_background ? "action_card_light" : "action_card_dark"}`}
      style={{
        backgroundColor: background_color,
      }}
      onClick={onClick}
    >
      <span className="action_card_badge">
        <Icon size={22} strokeWidth={2.2} />
      </span>

      <div className="action_card_content">
        <h2 className="action_card_title">
          {title}
        </h2>
        <p className="action_card_subtitle">
          {subtitle}
          <ArrowRight size={16} strokeWidth={2.4} className="action_card_arrow" />
        </p>
      </div>

      <Icon
        className="action_card_icon"
        size={120}
        strokeWidth={1.6}
        aria-hidden="true"
      />
    </button>
  );
};
export default ActionCard;
