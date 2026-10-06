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
import { getImageUrl } from "../../utils/get_image_url";
import EmptyState from "../../components/empty_state/empty_state";
import "../../components/modal/modal.css";
import { Pencil, Trash2, AlertCircle, MessageCircleQuestion, LogIn } from "lucide-react";

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

  // Fallback seguro de avatar por si se interrumpe la red local
  const defaultUserPlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150";

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
      } catch (error: any) {
        // Un 404 es esperado (publicación eliminada): no ensuciamos la consola
        if (error?.response?.status !== 404) {
          console.error("Error al cargar publicación:", error);
        }
        set_error(
          error?.response?.status === 404
            ? "Esta publicación ya no está disponible."
            : "Error al cargar publicación"
        );
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
  if (error) return (
    <div className="page_container narrow">
      <EmptyState icon={AlertCircle} title={error} />
    </div>
  );
  if (!publication) return (
    <div className="page_container narrow">
      <EmptyState icon={AlertCircle} title="Publicación no encontrada" />
    </div>
  );

  const is_owner = user && publication ? String(publication.usuario_id) === String(user.id) : false;
  const pending_count = questions.filter((q) => !q.respuesta).length;

  return (
    <div className="publication_detail_page">
      <Header />
      <main className="page_container">
        <PublicationDetail publication={publication} archives={archives} />

        <div className="publication_detail_bottom">
          {is_owner && (
            <div className="owner_actions_container">
              <span className="owner_actions_label">Tu publicación</span>
              <div className="owner_actions_buttons">
                <button
                  className="btn btn_ghost"
                  onClick={() => navigate(`/publicaciones/editar/${publication_id}`)}
                >
                  <Pencil size={18} strokeWidth={2.2} />
                  <span>Editar</span>
                </button>

                <button
                  className="btn btn_ghost owner_delete_button"
                  onClick={() => set_show_delete_modal(true)}
                >
                  <Trash2 size={18} strokeWidth={2.2} />
                  <span>Borrar</span>
                </button>
              </div>
            </div>
          )}

          <section className="questions_section">
            <div className="questions_header_container">
              <h2 className="section_title">Preguntas</h2>
              {questions.length > 0 && (
                <span className="questions_count">{questions.length}</span>
              )}
              {is_owner && pending_count > 0 && (
                <span className="questions_badge_pending">
                  {pending_count} PENDIENTES
                </span>
              )}
            </div>

            <div className="questions_list">
              {questions.length === 0 ? (
                <EmptyState
                  icon={MessageCircleQuestion}
                  title="No hay preguntas públicas aún"
                  compact
                />
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
                <div className="questions_actions">
                  <QuestionInput
                    value={new_question}
                    on_change={set_new_question}
                    on_submit={add_question}
                  />
                  <ClaimButton
                    otroUsuarioId={publication.usuario_id}
                    usuarioNombre={`${publication.usuario_nombre} ${publication.usuario_apellido}`}
                    // Resolvemos la URL real de la foto o mandamos el fallback seguro
                    usuarioAvatar={publication.usuario_foto ? getImageUrl(publication.usuario_foto) : defaultUserPlaceholder}
                  />
                </div>
              )
            ) : (
              <div className="login_required_container">
                <p className="login_required_text">
                  ¿Reconoces este objeto o tienes alguna duda?
                </p>
                <button
                  className="btn btn_primary"
                  onClick={() => navigate("/login")}
                >
                  <LogIn size={18} strokeWidth={2.2} />
                  Iniciar sesión para preguntar
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />

      {show_delete_modal && (
        <div className="delete_modal_overlay">
          <div className="delete_modal_card" role="dialog" aria-modal="true">
            <div className="delete_modal_icon_container">
              <Trash2 size={26} strokeWidth={2.2} />
            </div>
            <h2>¿Deseas borrar esta publicación?</h2>
            <p>No volverá a aparecer y se borrará permanentemente</p>
            <div className="modal_buttons_container">
              <button className="btn btn_danger btn_block" onClick={handle_delete_publication}>
                Confirmar
              </button>
              <button className="btn btn_ghost btn_block" onClick={() => set_show_delete_modal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationDetailPage;