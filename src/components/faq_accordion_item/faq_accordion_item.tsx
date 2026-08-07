import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
      <button className="faq_trigger" onClick={onToggle}>
        <span>{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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