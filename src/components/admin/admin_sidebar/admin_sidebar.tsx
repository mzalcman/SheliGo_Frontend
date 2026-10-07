import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import BrandLogo from "../../brand_logo/brand_logo";
import { ADMIN_NAV_ITEMS } from "../admin_nav";
import "./admin_sidebar.css";

interface AdminSidebarProps {
  collapsed: boolean;
  mobile_open: boolean;
  on_toggle_collapsed: () => void;
  on_close_mobile: () => void;
}

const AdminSidebar = ({ collapsed, mobile_open, on_toggle_collapsed, on_close_mobile }: AdminSidebarProps) => {
  const navigate = useNavigate();

  // Escape cierra el menú en móvil
  useEffect(() => {
    if (!mobile_open) return;
    const on_key = (event: KeyboardEvent) => {
      if (event.key === "Escape") on_close_mobile();
    };
    window.addEventListener("keydown", on_key);
    return () => window.removeEventListener("keydown", on_key);
  }, [mobile_open, on_close_mobile]);

  return (
    <>
      <div
        className={`admin_sidebar_backdrop ${mobile_open ? "is_visible" : ""}`}
        onClick={on_close_mobile}
        aria-hidden="true"
      />

      <aside
        className={`admin_sidebar ${collapsed ? "admin_sidebar_collapsed" : ""} ${mobile_open ? "is_open" : ""}`}
        aria-label="Navegación del backoffice"
      >
        <div className="admin_sidebar_brand">
          <BrandLogo size="sm" show_wordmark={!collapsed} />
          {!collapsed && <span className="admin_sidebar_tag">Backoffice</span>}
          <button className="icon_button admin_sidebar_close" onClick={on_close_mobile} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="admin_sidebar_nav">
          {ADMIN_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin"}
              className={({ isActive }) => `admin_sidebar_link ${isActive ? "is_active" : ""}`}
              title={collapsed ? label : undefined}
              onClick={on_close_mobile}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="admin_sidebar_label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin_sidebar_footer">
          <button
            className="admin_sidebar_link"
            onClick={() => navigate("/home")}
            title={collapsed ? "Volver a SheliGo" : undefined}
          >
            <ArrowLeft size={20} strokeWidth={2} />
            <span className="admin_sidebar_label">Volver a SheliGo</span>
          </button>
          <button
            className="admin_sidebar_link admin_sidebar_collapse"
            onClick={on_toggle_collapsed}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : undefined}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            <span className="admin_sidebar_label">Contraer menú</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
