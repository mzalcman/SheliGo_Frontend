import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Building2, CheckCircle2, History, Package, Tags, Users } from "lucide-react";
import AdminStatCard from "../../../components/admin/admin_stat_card/admin_stat_card";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import { AdminStateBadge, AdminTypeBadge } from "../../../components/admin/admin_badge/admin_badge";
import EmptyState from "../../../components/empty_state/empty_state";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { get_admin_dashboard } from "../../../services/admin/admin_dashboard_service";
import { get_admin_error_message, is_request_canceled } from "../../../services/admin/admin_error";
import { format_admin_relative, full_name } from "../../../utils/admin_format";
import { describe_activity } from "./admin_activity";
import type { AdminDashboard } from "../../../types/admin/admin_dashboard";
import "./admin_dashboard_page.css";

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminDashboard };

const day_label = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { session } = useAdminSession();
  const [state, set_state] = useState<DashboardState>({ status: "loading" });
  const [reload_key, set_reload_key] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    get_admin_dashboard(controller.signal)
      .then((data) => set_state({ status: "ready", data }))
      .catch((error) => {
        if (is_request_canceled(error)) return;
        set_state({ status: "error", message: get_admin_error_message(error) });
      });
    return () => controller.abort();
  }, [reload_key]);

  const retry = useCallback(() => {
    set_state({ status: "loading" });
    set_reload_key((key) => key + 1);
  }, []);

  if (state.status === "loading") return <AdminLoadingState label="Cargando el resumen..." />;
  if (state.status === "error") return <AdminErrorState message={state.message} on_retry={retry} />;

  const { totales, serie_publicaciones, publicaciones_recientes, instituciones_destacadas, actividad_reciente } = state.data;
  const resueltas = totales.publicaciones_activas + totales.publicaciones_recuperadas;
  const tasa = resueltas > 0 ? Math.round((totales.publicaciones_recuperadas / resueltas) * 100) : 0;
  const max_dia = Math.max(1, ...serie_publicaciones.map((d) => d.perdidos + d.encontrados));
  const total_serie = serie_publicaciones.reduce((sum, d) => sum + d.perdidos + d.encontrados, 0);
  const scope_text = session.es_global
    ? "Datos de toda la plataforma."
    : `Datos de ${session.instituciones.map((i) => i.nombre).join(", ")}.`;

  return (
    <div className="admin_page">
      <div className="admin_page_header">
        <div>
          <h2 className="admin_page_heading">Hola, {session.usuario.nombre}</h2>
          <p className="admin_page_lead">{scope_text}</p>
        </div>
      </div>

      <section className="admin_stats_grid" aria-label="Indicadores">
        <AdminStatCard label="Publicaciones activas" value={totales.publicaciones_activas} icon={Package}
          hint={`${totales.publicaciones_nuevas_30d} nuevas en 30 días`} />
        <AdminStatCard label="Objetos recuperados" value={totales.publicaciones_recuperadas} icon={CheckCircle2}
          tone="secondary" hint={`${tasa}% de recuperación`} />
        <AdminStatCard label="Usuarios" value={totales.usuarios_total} icon={Users}
          hint={`${totales.usuarios_nuevos_30d} nuevos en 30 días`} />
        <AdminStatCard label={session.es_global ? "Instituciones" : "Tus instituciones"} value={totales.instituciones_total}
          icon={Building2} tone="neutral" />
        <AdminStatCard label="Categorías" value={totales.categorias_total} icon={Tags} tone="neutral" />
        <AdminStatCard label="Eliminadas" value={totales.publicaciones_eliminadas} icon={Archive} tone="neutral"
          hint="Bajas lógicas, se pueden restaurar" />
      </section>

      <div className="admin_two_columns">
        <section className="admin_card">
          <div className="admin_card_header">
            <h3 className="admin_card_title">Publicaciones de los últimos 14 días</h3>
            <div className="admin_chart_legend">
              <span><i className="is_lost" />Perdidos ({totales.publicaciones_perdidos})</span>
              <span><i className="is_found" />Encontrados ({totales.publicaciones_encontrados})</span>
            </div>
          </div>
          {total_serie === 0 ? (
            <EmptyState compact icon={Package} title="Sin publicaciones nuevas"
              description="No se publicaron objetos en las últimas dos semanas." />
          ) : (
            <div className="admin_chart" role="img"
              aria-label={`${total_serie} publicaciones en los últimos 14 días`}>
              {serie_publicaciones.map((dia) => {
                const fecha = new Date(`${dia.fecha}T12:00:00`);
                return (
                  <div key={dia.fecha} className="admin_chart_column"
                    title={`${day_label.format(fecha)}: ${dia.perdidos} perdidos, ${dia.encontrados} encontrados`}>
                    <div className="admin_chart_bar">
                      <span className="is_found" style={{ height: `${(dia.encontrados / max_dia) * 100}%` }} />
                      <span className="is_lost" style={{ height: `${(dia.perdidos / max_dia) * 100}%` }} />
                    </div>
                    <span className="admin_chart_label">{fecha.getDate()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin_card">
          <div className="admin_card_header">
            <h3 className="admin_card_title">Instituciones con más actividad</h3>
          </div>
          {instituciones_destacadas.length === 0 ? (
            <EmptyState compact icon={Building2} title="Sin instituciones" />
          ) : (
            <div className="admin_list">
              {instituciones_destacadas.map((inst) => (
                <div key={inst.id} className="admin_list_item">
                  <span className="admin_cell_title">{inst.nombre}</span>
                  <span className="admin_muted admin_number">
                    {inst.publicaciones_activas} activas · {inst.publicaciones_recuperadas} recuperadas
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="admin_two_columns">
        <section className="admin_card">
          <div className="admin_card_header">
            <h3 className="admin_card_title">Últimas publicaciones</h3>
            <button className="btn btn_text" onClick={() => navigate("/admin/publicaciones")}>Ver todas</button>
          </div>
          {publicaciones_recientes.length === 0 ? (
            <EmptyState compact icon={Package} title="Todavía no hay publicaciones" />
          ) : (
            <div className="admin_list">
              {publicaciones_recientes.map((pub) => (
                <button key={pub.id} className="admin_list_item"
                  onClick={() => navigate(`/admin/publicaciones?ver=${pub.id}`)}>
                  <span className="admin_cell_text">
                    <span className="admin_cell_title">{pub.nombre}</span>
                    <span className="admin_cell_sub">
                      {[pub.institucion_nombre, pub.categoria_nombre].filter(Boolean).join(" · ") || "Sin institución"}
                      {" · "}{format_admin_relative(pub.created_at)}
                    </span>
                  </span>
                  <span className="admin_dashboard_badges">
                    <AdminTypeBadge tipo={pub.tipo} />
                    <AdminStateBadge estado={pub.estado} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="admin_card">
          <div className="admin_card_header">
            <h3 className="admin_card_title">Actividad del equipo</h3>
          </div>
          {actividad_reciente.length === 0 ? (
            <EmptyState compact icon={History} title="Sin actividad registrada"
              description="Acá vas a ver los cambios que hagan los administradores." />
          ) : (
            <ul className="admin_activity">
              {actividad_reciente.map((act) => (
                <li key={act.id}>
                  <p>
                    <strong>{full_name(act.admin_nombre, act.admin_apellido)}</strong> {describe_activity(act)}
                  </p>
                  <span className="admin_cell_sub">{format_admin_relative(act.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
