import "./publication_detail_page.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import PublicationDetail from "../../components/publication_detail/publication_detail";
import QuestionCard from "../../components/question_card/question_card";
import QuestionInput from "../../components/question_input/question_input";
import ClaimButton from "../../components/claim_button/claim_button";
import type { Publication } from "../../types/publication";
import type { Question } from "../../types/question";
import type { PublicationArchive } from "../../types/publication_archive";
import { get_publication_by_id } from "../../services/publication_service";
import { get_questions, create_question } from "../../services/question_service";
import { get_publication_archives } from "../../services/publication_archives_service";
import { useAuthContext } from "../../contexts/auth_context"; // 
import Loader from "../../components/loader/loader";

const PublicationDetailPage = () => {
  const { id } = useParams();
  const publication_id = id || "";
  
  const { user } = useAuthContext(); 

  const [publication, set_publication] = useState<Publication | null>(null);
  const [archives, set_archives] = useState<PublicationArchive[]>([]);
  const [questions, set_questions] = useState<Question[]>([]);
  const [new_question, set_new_question] = useState("");
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  const refresh_questions = async () => {
    try {
      const updated_questions = await get_questions(publication_id);
      set_questions(updated_questions);
    } catch (err) {
      console.error("Error al refrescar preguntas:", err);
    }
  };

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const [publication_data, archives_data, questions_data] = await Promise.all([
          get_publication_by_id(publication_id),
          get_publication_archives(publication_id),
          get_questions(publication_id),
        ]);

        set_publication(publication_data);
        set_archives(archives_data);
        set_questions(questions_data);
      } catch (error) {
        set_error("Error al cargar publicación");
      } finally {
        set_loading(false);
      }
    };

    fetch_data();
  }, [publication_id]);

  const add_question = async () => {
    if (!new_question.trim() || !user?.id) return; 

    try {
      await create_question(publication_id, user.id, new_question); 
      await refresh_questions();
      set_new_question("");
    } catch (error) {
      console.error("Error al añadir pregunta:", error);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;
  if (!publication) return <div>Publicación no encontrada</div>;

  const is_owner = user && publication ? String(publication.usuario_id) === String(user.id) : false;
  const pending_count = questions.filter((q) => !q.respuesta).length;

  return (
    <div className="publication_detail_page">
      <Header />
      <main className="publication_detail_content">
        <PublicationDetail publication={publication} archives={archives} />

        <section className="questions_section">
          <div className="questions_header_container">
            <h2 className="questions_title">Preguntas</h2>
            {is_owner && pending_count > 0 && (
              <span className="questions_badge_pending">
                {pending_count} PENDIENTES
              </span>
            )}
          </div>

          <div className="questions_list">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                is_owner={is_owner}
                on_answer_submitted={refresh_questions}
              />
            ))}
          </div>

          {!is_owner && (
            <QuestionInput
              value={new_question}
              on_change={set_new_question}
              on_submit={add_question}
            />
          )}
          
          {!is_owner && <ClaimButton />}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PublicationDetailPage;