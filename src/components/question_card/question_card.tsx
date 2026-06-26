import "./question_card.css";
import { useState } from "react";
import type { Question } from "../../types/question";
import QuestionInput from "../question_input/question_input";
import { create_answer } from "../../services/question_service"; 

interface QuestionCardProps {
  question: Question;
  is_owner?: boolean;
  on_answer_submitted?: () => void;
}

const QuestionCard = ({
  question,
  is_owner = false,
  on_answer_submitted,
}: QuestionCardProps) => {
  const [is_replying, set_is_replying] = useState(false);
  const [reply_text, set_reply_text] = useState("");

  const handle_submit_reply = async () => {
    if (!reply_text.trim()) return;
    try {
      await create_answer(question.id, reply_text); 
      
      set_is_replying(false);
      set_reply_text("");
      
      if (on_answer_submitted) on_answer_submitted(); 
    } catch (error) {
      console.error("Error al responder la pregunta:", error);
      alert("No se pudo enviar la respuesta. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="question_card">
      <div className="question_card_main">
        <div className="question_user">
          <img
            src={question.usuario?.foto || "/images/user_placeholder.png"}
            alt="Usuario"
            className="question_user_image"
          />
          <div className="question_user_meta">
            <span className="question_user_name">
              {question.usuario?.nombre} {question.usuario?.apellido}
            </span>
          </div>
        </div>

        <p className="question_content">"{question.contenido}"</p>

        {is_owner && !question.respuesta && !is_replying && (
          <button 
            className="question_reply_trigger"
            onClick={() => set_is_replying(true)}
          >
            ← RESPONDER A {(question.usuario?.nombre || "Usuario").toUpperCase()}
          </button>
        )}
      </div>

      {is_replying && (
        <div className="question_reply_form_container">
          <QuestionInput
            value={reply_text}
            on_change={set_reply_text}
            on_submit={handle_submit_reply}
          />
          <button 
            className="question_reply_cancel" 
            onClick={() => set_is_replying(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      {question.respuesta && (
        <div className="question_answer_container">
          <div className="question_answer_orange_line"></div>
          <img 
            src="/images/user_placeholder.png" 
            alt="Dueño" 
            className="question_answer_user_image"
          />
          <p className="question_answer_content">
            {question.respuesta.contenido}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;