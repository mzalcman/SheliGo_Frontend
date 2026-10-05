import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Inbox, Plus } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ObjectCard from "../../components/object_card/object_card";
import EmptyState from "../../components/empty_state/empty_state";
import "./my_publications_page.css";

// 🚀 Interface exacta igual al JSON que me pasaste de tu backend
interface BackendPublication {
    id: string;
    nombre?: string;
    descripcion?: string;
    tipo?: string; // "perdido" o "encontrado"
    estado?: string; // "activa", etc.
    lugar_institucion?: string;
    categoria_nombre?: string;
    institucion_nombre?: string;
    institucion_direccion?: string;
    foto_principal_url?: string; // 📸 Usamos el campo directo del back
    foto_principal_mime_type?: string | null;
    fecha_evento?: string;
}

const MyPublicationsPage = () => {
    const navigate = useNavigate();
    const [publications, setPublications] = useState<BackendPublication[]>([]);
    const [loading, setLoading] = useState(true);

    // Mapeamos la ubicación combinando el lugar interno y el nombre del lugar (ej: "Comedor - ORT Argentina")
    const parseLocation = (pub: BackendPublication): string => {
        if (!pub) return "Ubicación no especificada";
        const lugar = pub.lugar_institucion || "";
        const inst = pub.institucion_nombre || "";
        if (lugar && inst) return `${lugar} (${inst})`;
        return lugar || inst || "Ubicación no especificada";
    };

    useEffect(() => {
        const fetchMisPublicaciones = async () => {
            try {
                const token = localStorage.getItem("token");

                // 🚀 Cambiamos la ruta a la de tu controlador de publicaciones:
                const response = await fetch("http://localhost:3000/publicaciones/mias", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const resBody = await response.json();
                    
                    // 🎯 Extraemos el array del formato: resBody.data.publicaciones
                    const listaRaw = resBody?.data?.publicaciones || [];
                    setPublications(listaRaw);
                } else {
                    console.error("Respuesta del servidor no exitosa:", response.status);
                    setPublications([]);
                }
            } catch (error) {
                console.error("Error conectando con el backend:", error);
                setPublications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMisPublicaciones();
    }, []);

    return (
        <div className="mypubs_container">
            <Header />

            <main className="page_container">
                <div className="page_topbar">
                    <button className="icon_button" onClick={() => navigate(-1)} aria-label="Volver">
                        <ArrowLeft size={20} strokeWidth={2.2} />
                    </button>
                    <h1 className="page_title">Mis Publicaciones</h1>
                </div>

                <section className="mypubs_activity_section">
                    <div className="mypubs_activity_text">
                        <span className="eyebrow">TU ACTIVIDAD</span>
                        <h2 className="mypubs_headline">Gestiona tus hallazgos</h2>
                        <p className="mypubs_description">
                            {publications.length === 0
                                ? "Aún no has reportado ningún objeto. Tus publicaciones activas aparecerán listadas aquí para ayudarte a gestionarlas fácilmente."
                                : `Has reportado ${publications.length} ${publications.length === 1 ? 'objeto' : 'objetos'}. Mantén tus publicaciones actualizadas para ayudar a la comunidad.`
                            }
                        </p>
                    </div>

                    <div className="mypubs_badge_banner">
                        <span className="mypubs_badge_count">{publications.length}</span>
                        <span className="mypubs_badge_text">
                            {publications.length === 1 ? "OBJETO TOTAL" : "OBJETOS TOTALES"}
                        </span>
                    </div>
                </section>

                <div>
                    {loading ? (
                        <div className="mypubs_loading_spinner">
                            <div className="spinner"></div>
                            <p>Buscando tus publicaciones...</p>
                        </div>
                    ) : publications.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="¡Aún no publicaste nada!"
                            description="¿Encontraste un objeto perdido o estás buscando algo que se te cayó? Publícalo para que la comunidad pueda ayudarte."
                        >
                            <button
                                className="btn btn_primary"
                                onClick={() => navigate("/publicar")}
                            >
                                <Plus size={18} strokeWidth={2.4} />
                                Crear mi primera publicación
                            </button>
                        </EmptyState>
                    ) : (
                        <div className="mypubs_grid">
                            {publications.map((pub) => {
                                if (!pub || !pub.id) return null;

                                return (
                                    <ObjectCard
                                        key={pub.id}
                                        id={pub.id}
                                        title={pub.nombre || "Sin título"}
                                        status={pub.tipo || "perdido"}
                                        location={parseLocation(pub)}
                                        image={pub.foto_principal_url || ""}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyPublicationsPage;