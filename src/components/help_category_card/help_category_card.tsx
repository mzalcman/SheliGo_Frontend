import React from "react";
import "./help_category_card.css";

interface HelpCategoryCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const HelpCategoryCard: React.FC<HelpCategoryCardProps> = ({ title, desc, icon, onClick }) => {
  return (
    <div className="category_card" onClick={onClick}>
      <div className="category_icon_wrapper">{icon} </div>
      <div className="category_info">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
};

export default HelpCategoryCard;