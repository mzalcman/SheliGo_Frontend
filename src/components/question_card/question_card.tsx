import "./question_card.css";
import type { Question } from "../../types/question";

interface QuestionCardProps {
  question: Question;
}

const QuestionCard = ({
  question,
}: QuestionCardProps) => {

  return (
    <div className="question_card">
      <div className="question_user">

        <img
          src={
            question.usuario?.foto ||
            "/images/user_placeholder.png"}
          alt="Usuario"
          className="question_user_image"
        />

        <span className="question_user_name">
          {question.usuario?.nombre}
          {" "}
          {question.usuario?.apellido}
        </span>

      </div>

      <p className="question_content">
        {question.contenido}
      </p>

      {question.respuesta && (

        <div className="question_answer">
          <span className="question_answer_title">
            Respuesta
          </span>
          <p className="question_answer_content">
            {question.respuesta.contenido}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;