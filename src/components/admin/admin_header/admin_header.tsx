import { Menu } from "lucide-react";
import { useAdminSession } from "../../../hooks/use_admin_session";
import "./admin_header.css";

interface AdminHeaderProps {
  title: string;
  description: string;
  on_open_menu: () => void;
}

const AdminHeader = ({ title, description, on_open_menu }: AdminHeaderProps) => {
  const { session } = useAdminSession();
  const { usuario, es_global, instituciones } = session;
  const full_name = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim();

  // Alcance visible para que quede claro qué datos se están viendo
  const scope = es_global
    ? "Administrador general"
    : instituciones.length === 1
      ? `Admin · ${instituciones[0].nombre}`
      : `Admin · ${instituciones.length} instituciones`;

  return (
    <header className="admin_header">
      <button className="icon_button admin_header_menu" onClick={on_open_menu} aria-label="Abrir menú">
        <Menu size={20} />
      </button>

      <div className="admin_header_titles">
        <h1 className="admin_header_title">{title}</h1>
        <p className="admin_header_description">{description}</p>
      </div>

      <div className="admin_header_user">
        <div className="admin_header_user_text">
          <span className="admin_header_user_name">{full_name || usuario.email}</span>
          <span className="admin_header_scope" title={instituciones.map((i) => i.nombre).join(", ")}>
            {scope}
          </span>
        </div>
        <img
          src={usuario.foto || "/user_predeterminada.png"}
          alt=""
          className="admin_header_avatar"
          onError={(event) => {
            event.currentTarget.src = "/user_predeterminada.png";
          }}
        />
      </div>
    </header>
  );
};

export default AdminHeader;
