import "./question_card.css";
import { useState } from "react";
import type { Question } from "../../types/question";
import QuestionInput from "../question_input/question_input";
import { create_answer } from "../../services/question_service";
import type { Publication } from "../../types/publication";
import { getImageUrl } from "../../utils/get_image_url";

interface QuestionCardProps {
  question: Question;
  publication: Publication;
  is_owner?: boolean;
  on_answer_submitted?: () => void;
}

const QuestionCard = ({
  question,
  publication, 
  is_owner = false,
  on_answer_submitted,
}: QuestionCardProps) => {
  const [is_replying, set_is_replying] = useState(false);
  const [reply_text, set_reply_text] = useState("");
  const [is_submitting, set_is_submitting] = useState(false);
  const DEFAULT_USER_IMAGE = "/user_predeterminada.png";

  const handle_submit_reply = async () => {
    if (!reply_text.trim() || is_submitting) return;
    
    try {
      set_is_submitting(true);
      await create_answer(question.id, { contenido: reply_text.trim() });

      set_is_replying(false);
      set_reply_text("");

      if (on_answer_submitted) on_answer_submitted();
    } catch (error) {
      console.error("Error al responder la pregunta:", error);
      alert("No se pudo enviar la respuesta. Inténtalo de nuevo.");
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <div className="question_card">
      <div className="question_card_main">
        <div className="question_user">
          <img
            src={question.usuario?.foto ? getImageUrl(question.usuario.foto) : DEFAULT_USER_IMAGE}
            alt="Usuario"
            className="question_user_image"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_USER_IMAGE;
            }}
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

      {/* 🔴 INTERFAZ CORREGIDA: Sin duplicaciones y estilizado */}
      {is_replying && (
        <div className="answer_form_card animate_fade_in">
          <div className="answer_form_user">
            <img
              src={
                publication?.usuario_foto && publication.usuario_foto.trim() !== ""
                  ? getImageUrl(publication.usuario_foto)
                  : DEFAULT_USER_IMAGE
              }
              alt="Tu perfil"
              className="answer_form_avatar"
              onError={(e) => { e.currentTarget.src = DEFAULT_USER_IMAGE; }}
            />
            <span className="answer_form_username">Responder como Autor</span>
          </div>

          <div className="answer_input_wrapper">
            {/* Le pasamos el handle_submit_reply directo al QuestionInput */}
            <QuestionInput
              value={reply_text}
              on_change={set_reply_text}
              on_submit={handle_submit_reply}
              placeholder="Escribe aquí tu respuesta..."
            />
          </div>

          <div className="answer_form_actions">
            <button
              type="button"
              className="answer_cancel_button"
              onClick={() => set_is_replying(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {question.respuesta && (
        <div className="question_answer_container">
          <div className="question_answer_orange_line"></div>
          <img
            src={
              publication?.usuario_foto && publication.usuario_foto.trim() !== ""
                ? getImageUrl(publication.usuario_foto)
                : DEFAULT_USER_IMAGE
            }
            alt="Dueño"
            className="question_answer_user_image"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_USER_IMAGE;
            }}
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