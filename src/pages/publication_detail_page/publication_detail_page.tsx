import "./publication_detail_page.css";
import {useState,} from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import PublicationDetail from "../../components/publication_detail/publication_detail";
import QuestionCard from "../../components/question_card/question_card";
import QuestionInput from "../../components/question_input/question_input";
import ClaimButton from "../../components/claim_button/claim_button";
import { mock_publication } from "../../data/mock_publication";
import type {Question,} from "../../types/question";
import { mock_logged_user,} from "../../data/mock_user";

const PublicationDetailPage = () => {

  // Preguntas visibles
  const [
    questions,
    set_questions,
  ] = useState<Question[]>(
    mock_publication.preguntas
  );

  // Input pregunta
  const [
    new_question,
    set_new_question,
  ] = useState("");

  const add_question = () => {

    if (
      !new_question.trim() ) { return; }

    const question: Question = {

      id: Date.now(),

      user_name: mock_logged_user.name,
      user_image:mock_logged_user.profile_image,
      content: new_question,
      created_at: new Date().toISOString(),
    };

    set_questions(
      [
        ...questions,
        question,
      ]
    );
    set_new_question("");
  };
  return (

    <div className="publication_detail_page">
      <Header />
      <main className="publication_detail_content">
        <PublicationDetail
          publication={
            mock_publication
          } />
        <section className="questions_section">
          <h2 className="questions_title">
            Preguntas
          </h2>
          {
            questions.map(
              (
                question ) => (
                <QuestionCard
                  key={question.id}
                  question={question}/> )
            )
          }
          <QuestionInput value={ new_question }
          on_change={ set_new_question }
          on_submit={ add_question } />
          <ClaimButton />
        </section>
      </main>
      <Footer />
    </div>
  );
};
export default PublicationDetailPage;