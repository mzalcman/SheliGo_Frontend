import "./menu_page.css";
import { useEffect } from "react";
import { User, Package, Phone, Headphones, ArrowLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use_auth";
import { getImageUrl } from "../../utils/get_image_url";
import LogoutButton from "../../components/logout_button/logout_button";

const MenuPage = () => {
  const { user: typedUser, refetchUser } = useAuth();
  const navigate = useNavigate();

  const user = typedUser as any;
  const userFullName = user?.name || "Usuario";

  // Trae el rol actualizado (las sesiones iniciadas antes del backoffice no lo tienen)
  useEffect(() => {
    void refetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solo decide si mostrar el acceso: el backend valida el permiso al entrar a /admin
  const canSeeBackoffice = typedUser?.rol === "admin" || typedUser?.rol === "institution_admin";

  return (
    <main className="menu_page">
      <div className="menu_container">

        <div className="page_topbar">
          <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <span className="menu_topbar_title">Menu</span>
        </div>

        <div className="menu_profile">
          <div className="menu_profile_image_container">
            <img
              src={
                user?.profile_image
                  ? getImageUrl(user.profile_image)
                  : "/user_predeterminada.png"
              }
              alt={userFullName}
              className="menu_profile_image"
              onError={(event) => {
                event.currentTarget.src = "/user_predeterminada.png";
              }}
            />
            <div className="menu_online_dot" />
          </div>

          <h2 className="menu_name">{userFullName}</h2>

          <button
            className="btn btn_ghost btn_ghost_primary btn_sm"
            onClick={() => navigate("/perfil")}
          >
            Ver perfil
          </button>
        </div>

        <div className="menu_options">
          {canSeeBackoffice && (
            <button
              className="menu_option"
              onClick={() => navigate("/admin")}
            >
              <span className="menu_option_icon"><LayoutDashboard size={20} strokeWidth={2} /></span>
              <span className="menu_option_label">Backoffice</span>
              <ChevronRight size={18} className="menu_option_chevron" />
            </button>
          )}

          <button
            className="menu_option"
            onClick={() => navigate("/perfil/informacion-personal")}
          >
            <span className="menu_option_icon"><User size={20} strokeWidth={2} /></span>
            <span className="menu_option_label">Información personal</span>
            <ChevronRight size={18} className="menu_option_chevron" />
          </button>

          <button
            className="menu_option"
            onClick={() => navigate('/mispublicaciones')}
          >
            <span className="menu_option_icon"><Package size={20} strokeWidth={2} /></span>
            <span className="menu_option_label">Mis publicaciones</span>
            <ChevronRight size={18} className="menu_option_chevron" />
          </button>

          <button
            className="menu_option"
            onClick={() => navigate("/contactanos")}
          >
            <span className="menu_option_icon"><Phone size={20} strokeWidth={2} /></span>
            <span className="menu_option_label">Contactanos</span>
            <ChevronRight size={18} className="menu_option_chevron" />
          </button>

          <button
            className="menu_option"
            onClick={() => navigate("/ayuda")}
          >
            <span className="menu_option_icon"><Headphones size={20} strokeWidth={2} /></span>
            <span className="menu_option_label">Ayuda</span>
            <ChevronRight size={18} className="menu_option_chevron" />
          </button>
        </div>

        <div className="menu_footer">
          <LogoutButton />
        </div>

      </div>
    </main>
  );
};

export default MenuPage;