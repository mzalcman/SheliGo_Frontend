import { Suspense, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../hooks/use_auth";
import Loader from "../../loader/loader";
import AdminLayout from "../admin_layout/admin_layout";
import AdminSessionProvider from "../admin_session_provider/admin_session_provider";
import { AdminLoadingState } from "../admin_states/admin_states";
import AdminForbiddenPage from "../../../pages/admin/admin_forbidden_page/admin_forbidden_page";
import { get_admin_session } from "../../../services/admin/admin_session_service";
import { get_admin_error_message, get_admin_error_status } from "../../../services/admin/admin_error";
import type { AdminSession } from "../../../types/admin/admin_session";

type GuardState =
  | { status: "loading" }
  | { status: "ready"; session: AdminSession }
  | { status: "denied"; message: string; can_retry: boolean };

/* Guardia de /admin.
   No decide con user.rol del frontend: le pregunta al backend (GET /admin/me),
   que valida el JWT y lee el rol actual de la base. Aun si alguien fuerza
   esta pantalla, cada endpoint /admin vuelve a validar el permiso. */
const AdminRoute = () => {
  const { user, loading } = useAuth();
  const [state, set_state] = useState<GuardState>({ status: "loading" });
  const [attempt, set_attempt] = useState(0);
  const user_id = user?.id;

  useEffect(() => {
    if (!user_id) return;
    let active = true;
    get_admin_session()
      .then((session) => active && set_state({ status: "ready", session }))
      .catch((error) => {
        if (!active) return;
        set_state({
          status: "denied",
          message: get_admin_error_message(error, "No pudimos validar tu acceso al backoffice."),
          // 403 es una respuesta definitiva; el resto (red, 5xx) puede reintentarse
          can_retry: get_admin_error_status(error) !== 403,
        });
      });
    return () => {
      active = false;
    };
  }, [user_id, attempt]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (state.status === "loading") return <Loader />;

  if (state.status === "denied") {
    const retry = () => {
      set_state({ status: "loading" });
      set_attempt((value) => value + 1);
    };
    return <AdminForbiddenPage message={state.message} on_retry={state.can_retry ? retry : undefined} />;
  }

  return (
    <AdminSessionProvider session={state.session}>
      <AdminLayout>
        {/* Las páginas del backoffice se cargan bajo demanda: el layout queda visible */}
        <Suspense fallback={<AdminLoadingState />}>
          <Outlet />
        </Suspense>
      </AdminLayout>
    </AdminSessionProvider>
  );
};

export default AdminRoute;
