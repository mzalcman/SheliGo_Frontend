import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../admin_sidebar/admin_sidebar";
import AdminHeader from "../admin_header/admin_header";
import { find_admin_nav_item } from "../admin_nav";
import "../../../styles/admin.css";
import "./admin_layout.css";

const COLLAPSED_KEY = "admin_sidebar_collapsed";

/* Estructura del backoffice: sidebar fija en escritorio (colapsable) y
   menú lateral desplegable en pantallas chicas. */
const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [collapsed, set_collapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === "true");
  const [mobile_open, set_mobile_open] = useState(false);
  const current = find_admin_nav_item(pathname);

  // Al cambiar de sección la página vuelve arriba (el menú móvil se cierra al elegir un link)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.title = `${current.label} · Backoffice SheliGo`;
  }, [current]);

  const toggle_collapsed = () => {
    set_collapsed((value) => {
      localStorage.setItem(COLLAPSED_KEY, String(!value));
      return !value;
    });
  };

  return (
    <div className={`admin_layout ${collapsed ? "admin_layout_collapsed" : ""}`}>
      <AdminSidebar
        collapsed={collapsed}
        mobile_open={mobile_open}
        on_toggle_collapsed={toggle_collapsed}
        on_close_mobile={() => set_mobile_open(false)}
      />
      <div className="admin_layout_main">
        <AdminHeader title={current.label} description={current.description} on_open_menu={() => set_mobile_open(true)} />
        <main className="admin_layout_content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
