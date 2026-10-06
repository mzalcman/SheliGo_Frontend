import React from "react";
import { ChevronDown } from "lucide-react";
import "./faq_accordion_item.css";

interface FAQAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
}) => {
  return (
    <div className={`faq_item ${isOpen ? "open" : ""}`}>
      <button className="faq_trigger" onClick={onToggle} aria-expanded={isOpen}>
        <span>{question}</span>
        <ChevronDown size={20} className="faq_chevron" />
      </button>
      <div className="faq_answer_wrapper">
        <div className="faq_answer_content">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default FAQAccordionItem;
