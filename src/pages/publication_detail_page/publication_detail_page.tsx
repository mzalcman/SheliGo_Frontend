import "./publication_detail_page.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import PublicationDetail from "../../components/publication_detail/publication_detail";
import QuestionCard from "../../components/question_card/question_card";
import QuestionInput from "../../components/question_input/question_input";
import ClaimButton from "../../components/claim_button/claim_button";
import type { Publication } from "../../types/publication";
import type { Question } from "../../types/question";
import type { PublicationArchive } from "../../types/publication_archive";
import { get_publication_by_id, delete_publication } from "../../services/publication_service";
import { get_questions, create_question } from "../../services/question_service";
import { get_publication_archives } from "../../services/publication_archives_service";
import { useAuthContext } from "../../contexts/auth_context";
import Loader from "../../components/loader/loader";
import { Pencil, Trash2 } from "lucide-react";

const PublicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const publication_id = id || "";

  const { user } = useAuthContext();

  const [publication, set_publication] = useState<Publication | null>(null);
  const [archives, set_archives] = useState<PublicationArchive[]>([]);
  const [questions, set_questions] = useState<Question[]>([]);
  const [new_question, set_new_question] = useState("");
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  const [show_delete_modal, set_show_delete_modal] = useState(false);
  const [is_deleting, set_is_deleting] = useState(false);

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

  const handle_delete_publication = async () => {
    try {
      set_is_deleting(true);

      await delete_publication(publication_id);
      set_show_delete_modal(false);
      navigate("/home");
    } catch (err) {
      console.error("Error al eliminar la publicación:", err);
      alert("No se pudo eliminar la publicación. Inténtalo de nuevo.");
    } finally {
      set_is_deleting(false);
    }
  };

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

  if (loading || is_deleting) return <Loader />;
  if (error) return <div>{error}</div>;
  if (!publication) return <div>Publicación no encontrada</div>;

  const is_owner = user && publication ? String(publication.usuario_id) === String(user.id) : false;
  const pending_count = questions.filter((q) => !q.respuesta).length;

  return (
    <div className="publication_detail_page">
      <Header />
      <main className="publication_detail_content">
        <PublicationDetail publication={publication} archives={archives} />

        {is_owner && (
          <div className="owner_actions_container">
            <button
              className="publication_edit_pill_button"
              onClick={() => navigate(`/publicaciones/editar/${publication_id}`)}
            >
              <Pencil size={18} strokeWidth={2.5} />
              <span>Editar</span>
            </button>

            <button
              className="publication_delete_pill_button"
              onClick={() => set_show_delete_modal(true)}
            >
              <Trash2 size={18} strokeWidth={2.5} />
              <span>Borrar</span>
            </button>
          </div>
        )}

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
            {questions.length === 0 ? (
              <p className="no_questions_text">No hay preguntas públicas aún</p>
            ) : (
              questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  publication={publication}
                  is_owner={is_owner}
                  on_answer_submitted={refresh_questions}
                />
              ))
            )}
          </div>

          {user ? (
            !is_owner && (
              <>
                <QuestionInput
                  value={new_question}
                  on_change={set_new_question}
                  on_submit={add_question}
                />
                <ClaimButton
                  otroUsuarioId={publication.usuario_id}
                  usuarioNombre={`${publication.usuario_nombre} ${publication.usuario_apellido}`} 
                  usuarioAvatar={publication.usuario_foto} 
                />
              </>
            )
          ) : (
            <div className="login_required_container">
              <p className="login_required_text">
                ¿Reconoces este objeto o tienes alguna duda?
              </p>
              <button
                className="login_redirect_button"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión para preguntar
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />

      {show_delete_modal && (
        <div className="delete_modal_overlay">
          <div className="delete_modal_card">
            <div className="delete_modal_icon_container">
              <Trash2 size={24} color="#D32F2F" strokeWidth={2.5} />
            </div>
            <h2>¿Deseas borrar esta publicación?</h2>
            <p>No volverá a aparecer y se borrará permanentemente</p>
            <button className="modal_confirm_button" onClick={handle_delete_publication}>
              Confirmar
            </button>
            <button className="modal_cancel_button" onClick={() => set_show_delete_modal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PublicationDetailPage;