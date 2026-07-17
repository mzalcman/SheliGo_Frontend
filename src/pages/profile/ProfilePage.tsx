import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Shield, Edit2, CheckCircle2, History, Key } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import LogoutButton from "../../components/logout_button/logout_button";
import { useAuth } from "../../hooks/use_auth"; // 👈 Tu hook real
import { getImageUrl } from "../../utils/get_image_url"; // 👈 Tu utilitario de imágenes
import "./profile_page.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: typedUser } = useAuth(); // 👈 Consumimos los datos reales

  const user = typedUser as any;
  const userFullName = user?.nombre && user?.apellido 
    ? `${user.nombre} ${user.apellido}` 
    : user?.name || "Usuario";

  // Placeholder de respaldo para evitar llamadas rotas al localhost
  const defaultPlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150";

  // Objetos temporales (Manteniendo tu estructura)
  const misObjetos = [
    {
      id: "1",
      titulo: "Llaves de Casa",
      estado: "BUSCANDO",
      fechaText: "Reportado hace 2 días",
      img: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=100",
    },
    {
      id: "2",
      titulo: "Billetera de cuero",
      estado: "LOCALIZADO",
      fechaText: "Reportado hace 5 días",
      img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=100",
    },
  ];

  const historial = [
    {
      id: "h1",
      titulo: "Cámara Sony Alpha",
      detalle: "Entregado a Sofia G. • 12 Oct",
      tipo: "entregado",
    },
    {
      id: "h2",
      titulo: "Airpods Pro",
      detalle: "Reporte cerrado • 05 Oct",
      tipo: "cerrado",
    },
  ];

  return (
    <div className="profile_layout_page">
      <Header />

      <main className="profile_scroll_container">
        {/* Cabecera de Perfil: Redirige al tocar la imagen */}
        <section className="profile_hero_section">
          <div 
            className="profile_avatar_wrapper"
            onClick={() => navigate("/perfil/informacion-personal")} 
            style={{ cursor: "pointer" }}
          >
            <img 
              src={user?.foto ? getImageUrl(user.foto) : defaultPlaceholder} 
              alt={userFullName} 
              className="profile_main_avatar" 
              onError={(e) => {
                // Si falla la imagen por error de red o URL inválida, inyecta el placeholder
                (e.target as HTMLImageElement).src = defaultPlaceholder;
              }}
            />
            <button 
              className="profile_edit_avatar_badge"
              title="Editar Perfil"
              type="button"
            >
              <Edit2 size={12} strokeWidth={3} />
            </button>
          </div>
          <h1 className="profile_user_display_name">
            {userFullName}
          </h1>
        </section>

        {/* Tarjeta de Estadísticas */}
        <section className="profile_stats_row">
          <div className="profile_stat_item">
            <span className="profile_stat_number">12</span>
            <span className="profile_stat_label">REPORTES</span>
          </div>
          <div className="profile_stat_divider" />
          <div className="profile_stat_item">
            <span className="profile_stat_number">8</span>
            <span className="profile_stat_label">RECUPERADOS</span>
          </div>
        </section>

        {/* Sección Mis Objetos */}
        <section className="profile_block_section">
          <div className="profile_section_header">
            <h2>Mis objetos</h2>
            <button className="profile_see_all_btn" onClick={() => navigate("/mispublicaciones")}>
              VER TODOS
            </button>
          </div>

          <div className="profile_cards_stack">
            {misObjetos.map((objeto) => (
              <div key={objeto.id} className="profile_item_card">
                <img src={objeto.img} alt={objeto.titulo} className="profile_item_thumbnail" />
                <div className="profile_item_info">
                  <h3>{objeto.titulo}</h3>
                  <p>{objeto.fechaText}</p>
                </div>
                <span className={`profile_item_badge badge_${objeto.estado.toLowerCase()}`}>
                  {objeto.estado}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Sección Historial */}
        <section className="profile_block_section">
          <div className="profile_section_header">
            <h2>Historial</h2>
            <button className="profile_see_all_btn" onClick={() => navigate("/historial")}>
              VER TODO
            </button>
          </div>

          <div className="profile_cards_stack">
            {historial.map((hist) => (
              <div key={hist.id} className="profile_history_card">
                <div className="profile_history_icon_container">
                  {hist.tipo === "entregado" ? (
                    <CheckCircle2 size={18} color="#757575" />
                  ) : (
                    <History size={18} color="#757575" />
                  )}
                </div>
                <div className="profile_history_info">
                  <h3>{hist.titulo}</h3>
                  <p>{hist.detalle}</p>
                </div>
                <ArrowRight size={16} color="#B0B0B0" className="profile_row_arrow" />
              </div>
            ))}
          </div>
        </section>

        {/* Sección Configuración */}
        <section className="profile_block_section profile_config_block">
          <h2>Configuración</h2>
          <div className="profile_config_menu_card">
            
            {/* 1. Información Personal */}
            <button 
              className="profile_config_row_btn" 
              onClick={() => navigate("/perfil/informacion-personal")}
            >
              <div className="profile_config_left">
                <User size={18} color="#1A1A1A" />
                <span>Información Personal</span>
              </div>
              <ArrowRight size={16} color="#B0B0B0" />
            </button>

            {/* 2. Cambiar Contraseña */}
            <button 
              className="profile_config_row_btn" 
              onClick={() => navigate("/cambiar-contrasena")}
            >
              <div className="profile_config_left">
                <Key size={18} color="#1A1A1A" />
                <span>Cambiar Contraseña</span>
              </div>
              <ArrowRight size={16} color="#B0B0B0" />
            </button>

            {/* 3. Privacidad y Seguridad */}
            <button className="profile_config_row_btn" type="button">
              <div className="profile_config_left">
                <Shield size={18} color="#1A1A1A" />
                <span>Privacidad y seguridad</span>
              </div>
              <ArrowRight size={16} color="#B0B0B0" />
            </button>

            {/* 4. Cerrar Sesión */}
            <LogoutButton />

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;