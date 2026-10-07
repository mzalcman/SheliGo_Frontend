import type { LucideIcon } from "lucide-react";
import "./admin_stat_card.css";

interface AdminStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "secondary" | "neutral";
}

const number_format = new Intl.NumberFormat("es-AR");

const AdminStatCard = ({ label, value, icon: Icon, hint, tone = "primary" }: AdminStatCardProps) => (
  <article className="admin_stat_card">
    <div className={`admin_stat_icon admin_stat_icon_${tone}`}>
      <Icon size={20} strokeWidth={2} />
    </div>
    <div className="admin_stat_body">
      <span className="admin_stat_label">{label}</span>
      <strong className="admin_stat_value">{number_format.format(value)}</strong>
      {hint && <span className="admin_stat_hint">{hint}</span>}
    </div>
  </article>
);

export default AdminStatCard;
