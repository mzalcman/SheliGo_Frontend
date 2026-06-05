import "./publication_detail_page.css";
import {useEffect,useState,} from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import PublicationDetail from "../../components/publication_detail/publication_detail";
import QuestionCard from "../../components/question_card/question_card";
import QuestionInput from "../../components/question_input/question_input";
import ClaimButton from "../../components/claim_button/claim_button";
import type {Publication,} from "../../types/publication";
import type {Question,} from "../../types/question";
import type {PublicationArchive,} from "../../types/publication_archive";
import {get_publication_by_id,} from "../../services/publication_service";
import {get_questions,create_question,} from "../../services/question_service";
import {get_publication_archives,} from "../../services/publication_archives_service";
import {mock_logged_user,} from "../../data/mock_user";
import { useParams } from "react-router-dom";

const PublicationDetailPage =
() => {
  const { id } = useParams();
  const publication_id = id;  const [ publication, set_publication,] = useState< Publication | null >(null);
  const [archives,set_archives,] = useState< PublicationArchive[] >([]);
  const [questions, set_questions, ] = useState<Question[]>([]);
  const [ new_question, set_new_question, ] = useState("");
  const [loading,set_loading,] = useState(true);
  const [error,set_error, ] = useState("");

  useEffect(() => {
    const fetch_data =
      async () => {
        try {
          const [
            publication_data,archives_data,questions_data,
          ] = await Promise.all([

            get_publication_by_id(publication_id),
            get_publication_archives(publication_id),
            get_questions(publication_id),
          ]);

          set_publication(publication_data);
          set_archives(archives_data);
          set_questions(questions_data);
        } catch (error) {
          set_error(
            "Error al cargar publicación"
          );

        } finally {
          set_loading(false);
        }
      };

    fetch_data();

  }, []);

  const add_question =
    async () => {
      if (
        !new_question.trim()
      ) {
        return;
      }

      try {
        const created_question =
          await create_question(
            publication_id,
            mock_logged_user.id,
            new_question
          );
        set_questions([
          ...questions,
          created_question,
        ]);
        set_new_question("");
      } catch (error) {
        console.log(
          "Error creando pregunta"
        );
      }
    };
  if (loading) {

    return (
      <div>
        Cargando...
      </div>
    );
  }

  if (error) {

    return (
      <div>
        {error}
      </div>
    );
  }

  if (!publication) {

    return (
      <div>
        Publicación no encontrada
      </div>
    );
  }

  return (
    <div className="publication_detail_page">
      <Header />
      <main className="publication_detail_content">
        <PublicationDetail
          publication={
            publication
          }
          archives={
            archives
          }
        />

        <section className="questions_section">
          <h2 className="questions_title">
            Preguntas
          </h2>

          {
            questions.map(
              (question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                />
              )
            )
          }

          <QuestionInput
            value={
              new_question}
            on_change={
              set_new_question}
            on_submit={
              add_question}/>
          <ClaimButton />
        </section>
      </main>
      <Footer />

    </div>
  );
};

export default
PublicationDetailPage;