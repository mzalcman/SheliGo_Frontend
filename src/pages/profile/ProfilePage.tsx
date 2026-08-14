import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Shield, Edit2, CheckCircle2, History, Key } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import LogoutButton from "../../components/logout_button/logout_button";
import { useAuth } from "../../hooks/use_auth";
import { getImageUrl } from "../../utils/get_image_url";
import "./profile_page.css";

interface BackendPublication {
  id: string;
  nombre?: string;
  tipo?: string; // "perdido", "encontrado", etc.
  estado?: string; // "activa", "inactiva", "resuelto", "cerrado", etc.
  foto_principal_url?: string;
  created_at?: string;
  fecha_evento?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: typedUser } = useAuth();
  const user = typedUser as any;

  const [publications, setPublications] = useState<BackendPublication[]>([]);
  const [recuperadosCount, setRecuperadosCount] = useState<number>(0);
  const [loadingPubs, setLoadingPubs] = useState(true);

  const userFullName = user?.name || "Usuario";

  // Función para formatear fechas amigables (Ej: "Reportado hace 2 días")
  const calcularHaceCuanto = (fechaIso?: string): string => {
    if (!fechaIso) return "Reportado recientemente";
    const fecha = new Date(fechaIso);
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    if (dias === 0) return "Reportado hoy";
    if (dias === 1) return "Reportado ayer";
    return `Reportado hace ${dias} días`;
  };

  // Traer publicaciones reales del servidor
  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:3000/publicaciones/mias", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const resBody = await response.json();
          const listaRaw: BackendPublication[] = resBody?.data?.publicaciones || [];
          setPublications(listaRaw);

          // 🎯 LÓGICA DE RECUPERADOS:
          // Contamos las publicaciones que ya no están activas (desactivadas, resueltas, recuperadas, etc.)
          const recuperadas = listaRaw.filter((pub) => {
            const est = (pub.estado || "").toLowerCase();
            return est === "inactiva" || est === "resuelto" || est === "recuperado" || est === "cerrado";
          }).length;

          setRecuperadosCount(recuperadas);
        } else {
          console.error("Error al traer publicaciones del perfil:", response.status);
          setPublications([]);
          setRecuperadosCount(0);
        }
      } catch (error) {
        console.error("Error de red al conectar con el backend:", error);
        setPublications([]);
        setRecuperadosCount(0);
      } finally {
        setLoadingPubs(false);
      }
    };

    fetchMisPublicaciones();
  }, []);

  // Datos de prueba para la sección Historial
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
        {/* Cabecera del Usuario */}
        <section className="profile_hero_section">
          <div
            className="profile_avatar_wrapper"
            onClick={() => navigate("/perfil/informacion-personal")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={
                user?.profile_image
                  ? getImageUrl(user.profile_image)
                  : "/default-user.png"
              }
              alt={userFullName}
              className="profile_main_avatar"
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

        {/* Tarjeta de Estadísticas Reales */}
        <section className="profile_stats_row">
          <div className="profile_stat_item">
            <span className="profile_stat_number">{publications.length}</span>
            <span className="profile_stat_label">REPORTES</span>
          </div>
          <div className="profile_stat_divider" />
          <div className="profile_stat_item">
            <span className="profile_stat_number">{recuperadosCount}</span>
            <span className="profile_stat_label">RECUPERADOS</span>
          </div>
        </section>

        {/* Sección Mis Objetos (Muestra hasta 3) */}
        <section className="profile_block_section">
          <div className="profile_section_header">
            <h2>Mis objetos</h2>
            <button className="profile_see_all_btn" onClick={() => navigate("/mispublicaciones")}>
              VER TODOS
            </button>
          </div>

          <div className="profile_cards_stack">
            {loadingPubs ? (
              <p style={{ textAlign: "center", color: "#6e6e6e", padding: "10px 0" }}>
                Cargando objetos...
              </p>
            ) : publications.length > 0 ? (
              publications.slice(0, 3).map((pub) => {
                if (!pub || !pub.id) return null;

                const estadoTexto = (pub.tipo || "BUSCANDO").toUpperCase();
                const imagenFinal = pub.foto_principal_url || "/obj_predeterminada.png";
                const textoFecha = calcularHaceCuanto(pub.created_at || pub.fecha_evento);

                return (
                  <div
                    key={pub.id}
                    className="profile_item_card"
                    onClick={() => navigate(`/publicacion/${pub.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={imagenFinal}
                      alt={pub.nombre || "Objeto"}
                      className="profile_item_thumbnail"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/obj_predeterminada.png";
                      }}
                    />
                    <div className="profile_item_info">
                      <h3>{pub.nombre || "Sin título"}</h3>
                      <p>{textoFecha}</p>
                    </div>
                    <span className={`profile_item_badge badge_${(pub.tipo || "buscando").toLowerCase()}`}>
                      {estadoTexto}
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: "center", color: "#888", fontSize: "14px", padding: "12px 0" }}>
                No tienes publicaciones activas aún.
              </p>
            )}
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
            <button
              className="profile_config_row_btn"
              type="button"
              onClick={() => navigate("/privacidad-y-seguridad")} 
            >
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