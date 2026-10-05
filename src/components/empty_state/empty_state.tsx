import "./empty_state.css";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  compact?: boolean;
}

/* Estado vacío reutilizable. Solo presentación: el contenido lo decide quien lo usa. */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  children,
  compact = false,
}: EmptyStateProps) => {
  return (
    <div className={`empty_state animate_fade_in ${compact ? "empty_state_compact" : ""}`}>
      <div className="empty_state_icon">
        <Icon size={compact ? 22 : 28} strokeWidth={2} />
      </div>
      <h3 className="empty_state_title">{title}</h3>
      {description && <p className="empty_state_description">{description}</p>}
      {children && <div className="empty_state_actions">{children}</div>}
    </div>
  );
};

export default EmptyState;
