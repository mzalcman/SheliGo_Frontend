import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ObjectCard from "../../components/object_card/object_card";
import { useAuth } from "../../hooks/use_auth";
import { getImageUrl } from "../../utils/get_image_url";
import "./my_publications_page.css";

// Interface adaptada al formato real de tu backend
interface BackendPublication {
    id: string;
    nombre?: string;
    descripcion?: string;
    tipo?: string; // "perdido" o "encontrado"
    estado?: string; // "activa", etc.
    lugar_institucion?: string;
    archivos?: { url: string }[] | string;
    fecha_evento?: string;
    created_at?: string;
}

const MyPublicationsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [publications, setPublications] = useState<BackendPublication[]>([]);
    const [loading, setLoading] = useState(true);

    // PARSE LOCATION (Usa lugar_institucion de tu Back)
    const parseLocation = (pub: BackendPublication): string => {
        if (!pub) return "Ubicación no especificada";
        return pub.lugar_institucion || "Ubicación no especificada";
    };

    const parseImage = (pub: BackendPublication): string => {
        if (!pub || !pub.archivos) return "";
        
        if (Array.isArray(pub.archivos) && pub.archivos.length > 0) {
            const primerArchivo = pub.archivos[0];
            if (primerArchivo && typeof primerArchivo === "object" && "url" in primerArchivo) {
                return getImageUrl(primerArchivo.url);
            }
        }
        if (typeof pub.archivos === "string") {
            return getImageUrl(pub.archivos);
        }
        return "";
    };

    useEffect(() => {
        const fetchMisPublicaciones = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("http://localhost:3000/usuarios/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const resBody = await response.json();

                    // Intentamos mapear si viene un array directo, dentro de .publicaciones, o si viene una única publicación envuelta
                    let listaRaw = resBody?.data?.publicaciones || resBody?.publicaciones || resBody;
                    
                    // Si el back te manda un objeto único "publicacion": { ... } en lugar de un array
                    if (resBody?.publicacion && typeof resBody.publicacion === "object") {
                        listaRaw = [resBody.publicacion];
                    }

                    const listaPublicaciones = Array.isArray(listaRaw) ? listaRaw : [];
                    setPublications(listaPublicaciones);
                } else {
                    //  MOCKUP AUTOMÁTICO (Mientras el back no esté listo)
                    setPublications([
                        {
                            id: "9ef2c6f5-dbe8-44b0-9bb0-c39cbfe88752",
                            nombre: "Cargador Apple",
                            descripcion: "Cargador con cable USB-C...",
                            tipo: "perdido",
                            estado: "activa",
                            lugar_institucion: "Comedor",
                            archivos: "https://images.unsplash.com/photo-1619489646924-b4fce76b7552?w=500"
                        },
                        {
                            id: "8ax2c6f5-dbe8-44b0-9bb0-c39cbfe88751",
                            nombre: "Cartera de Cuero",
                            descripcion: "Cartera marrón de cuero legítimo...",
                            tipo: "encontrado",
                            estado: "activa",
                            lugar_institucion: "Comedor",
                            archivos: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500"
                        }
                    ]);
                }
            } catch (error) {
                console.error("Error cargando tus publicaciones:", error);
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

            <main className="mypubs_content">

                <div className="mypubs_navigation_header">
                    <button className="mypubs_back_btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={28} color="#ff6f00" strokeWidth={2.5} />
                    </button>
                    <h1 className="mypubs_title">Mis Publicaciones</h1>
                </div>

                <div className="mypubs_activity_section">
                    <span className="mypubs_subtitle">TU ACTIVIDAD</span>
                    <h2 className="mypubs_headline">Gestiona tus hallazgos</h2>
                    <p className="mypubs_description">
                        {publications.length === 0
                            ? "Aún no has reportado ningún objeto. Tus publicaciones activas aparecerán listadas aquí para ayudarte a gestionarlas fácilmente."
                            : `Has reportado ${publications.length} ${publications.length === 1 ? 'objeto' : 'objetos'} este mes. Mantén tus publicaciones actualizadas para ayudar a la comunidad.`
                        }
                    </p>
                </div>

                <div className="mypubs_badge_banner">
                    <span className="mypubs_badge_count">{publications.length}</span>
                    <span className="mypubs_badge_text">
                        {publications.length === 1 ? "OBJETO TOTAL" : "OBJETOS TOTALES"}
                    </span>
                </div>

                <div className="mypubs_list_wrapper">
                    {loading ? (
                        <div className="mypubs_loading_spinner">
                            <div className="spinner"></div>
                            <p>Buscando tus publicaciones...</p>
                        </div>
                    ) : publications.length === 0 ? (

                        <div className="mypubs_empty_state">
                            <div className="mypubs_empty_icon_wrapper">
                                <Inbox size={48} color="#ff6f00" />
                            </div>
                            <h3 className="mypubs_empty_title">¡Aún no publicaste nada!</h3>
                            <p className="mypubs_empty_subtitle">
                                ¿Encontraste un objeto perdido o estás buscando algo que se te cayó? Publícalo para que la comunidad pueda ayudarte.
                            </p>
                            <button
                                className="mypubs_empty_action_btn"
                                onClick={() => navigate("/publicar")}
                            >
                                Crear mi primera publicación
                            </button>
                        </div>

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
                                        image={parseImage(pub)}
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