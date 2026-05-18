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
          src={question.user_image}
          alt={question.user_name}
          className="question_user_image"/>

        <span className="question_user_name">
          {question.user_name}
        </span>
      </div>

      <p className="question_content">
        {question.content}
      </p>

    </div>

  );
};
export default QuestionCard;