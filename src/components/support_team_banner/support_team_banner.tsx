import React from "react";
import "./support_team_banner.css";

interface SupportTeamBannerProps {
  avatars?: string[];
  title?: string;
  subtitle?: string;
}

const defaultAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
];

const SupportTeamBanner: React.FC<SupportTeamBannerProps> = ({
  avatars = defaultAvatars,
  title = "¿No encontrás lo que buscás?",
  subtitle = "Nuestro equipo de soporte está en línea ahora mismo.",
}) => {
  return (
    <div className="support_team_pill">
      <div className="avatar_group">
        {avatars.map((avatarUrl, index) => (
          <img key={index} src={avatarUrl} alt={`Soporte ${index + 1}`} />
        ))}
      </div>
      <div className="support_team_text">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default SupportTeamBanner;