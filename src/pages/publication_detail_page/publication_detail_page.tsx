import "./publication_detail_page.css";
import { useEffect, useState } from "react";
import axios from "axios";
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
import { get_publication_by_id, delete_publication, update_publication_state } from "../../services/publication_service";
import Modal from "../../components/modal/modal";
import { get_questions, create_question } from "../../services/question_service";
import { get_publication_archives } from "../../services/publication_archives_service";
import { useAuthContext } from "../../contexts/auth_context";
import Loader from "../../components/loader/loader";
import { getImageUrl } from "../../utils/get_image_url";
import EmptyState from "../../components/empty_state/empty_state";
import "../../components/modal/modal.css";
import { Pencil, Trash2, AlertCircle, MessageCircleQuestion, LogIn, PackageCheck, RotateCcw } from "lucide-react";

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
  const [show_state_modal, set_show_state_modal] = useState(false);
  const [is_updating_state, set_is_updating_state] = useState(false);
  const [state_error, set_state_error] = useState("");

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

  // Activa ⇄ recuperada. Se persiste en el backend y la vista toma el estado que devuelve.
  const handle_toggle_state = async () => {
    if (!publication) return;
    const next_state = publication.estado === "recuperada" ? "activa" : "recuperada";
    try {
      set_is_updating_state(true);
      set_state_error("");
      const updated = await update_publication_state(publication_id, next_state);
      set_publication({ ...publication, estado: updated?.estado ?? next_state });
      set_show_state_modal(false);
    } catch (err) {
      console.error("Error al cambiar el estado de la publicación:", err);
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      set_state_error(message || "No se pudo actualizar el estado. Inténtalo de nuevo.");
    } finally {
      set_is_updating_state(false);
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
  const is_recovered = publication.estado === "recuperada";

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
                  className="btn btn_ghost"
                  onClick={() => {
                    set_state_error("");
                    set_show_state_modal(true);
                  }}
                >
                  {is_recovered ? (
                    <RotateCcw size={18} strokeWidth={2.2} />
                  ) : (
                    <PackageCheck size={18} strokeWidth={2.2} />
                  )}
                  <span>{is_recovered ? "Volver a activa" : "Marcar recuperada"}</span>
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
                  {is_recovered ? (
                    <p className="publication_recovered_note">
                      Este objeto ya fue recuperado por su dueño.
                    </p>
                  ) : (
                  <ClaimButton
                    otroUsuarioId={publication.usuario_id}
                    usuarioNombre={`${publication.usuario_nombre} ${publication.usuario_apellido}`}
                    // Resolvemos la URL real de la foto o mandamos el fallback seguro
                    usuarioAvatar={publication.usuario_foto ? getImageUrl(publication.usuario_foto) : defaultUserPlaceholder}
                  />
                  )}
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

      <Modal
        isOpen={show_state_modal}
        onClose={() => !is_updating_state && set_show_state_modal(false)}
        variant="confirm"
        icon={is_recovered ? <RotateCcw size={26} /> : <PackageCheck size={26} />}
        title={is_recovered ? "¿Volver a publicar como activa?" : "¿Ya recuperaste este objeto?"}
        description={
          is_recovered
            ? "La publicación volverá a aparecer en Inicio y en Buscar."
            : "La publicación se marcará como recuperada y dejará de aparecer en Inicio y en Buscar."
        }
        confirmText={is_updating_state ? "Guardando..." : is_recovered ? "Volver a activa" : "Marcar como recuperada"}
        onConfirm={is_updating_state ? undefined : handle_toggle_state}
      >
        {state_error && <p className="form_alert form_alert_error">{state_error}</p>}
      </Modal>

      {show_delete_modal && (
        <div className="delete_modal_overlay">
          <div className="delete_modal_card" role="dialog" aria-modal="true">
            <div className="delete_modal_icon_container">
              <Trash2 size={26} strokeWidth={2.2} />
            </div>
            <h2>¿Deseas borrar esta publicación?</h2>
            <p>Dejará de mostrarse en SheliGo para todos los usuarios.</p>
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