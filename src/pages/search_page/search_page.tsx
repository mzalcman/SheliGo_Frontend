import "./search_page.css";
import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import PublishBanner from "../../components/publish_banner/publish_banner";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ObjectCard from "../../components/object_card/object_card";
import SearchFilters from "../../components/search_filters/search_filters";
import { searchPublications } from "../../services/search_service";
import { useAuth } from "../../hooks/use_auth";
import type { User } from "../../types/user";

const SearchPage = () => {
  const [objects, setObjects] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [openFilter, setOpenFilter] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [instituciones, setInstituciones] = useState<string[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tipo, setTipo] = useState("");

  const { user } = useAuth() as { user: User | null };

  const clearFilters = () => {
    setSearchText("");
    setCategorias([]);
    setInstituciones([]);
    setFechaDesde("");
    setFechaHasta("");
    setTipo("");
    setOpenFilter("");
  };

  useEffect(() => {
    const buscar = async () => {
      try {
        const publicaciones = await searchPublications({
          busqueda: searchText || undefined,
          categoria_id: categorias.length ? categorias.join(",") : undefined,
          institucion_id: instituciones.length ? instituciones.join(",") : undefined,
          tipo: tipo || undefined,
          fecha_desde: fechaDesde || undefined,
          fecha_hasta: fechaHasta || undefined,
        });
        setObjects(publicaciones || []);
      } catch (error) {
        console.error("Error al buscar publicaciones:", error);
      }
    };
    buscar();
  }, [searchText, categorias, instituciones, fechaDesde, fechaHasta, tipo]);

  // Filtrado de las publicaciones devueltas por las instituciones del usuario
  const filteredObjects = useMemo(() => {
    if (!objects || objects.length === 0) return [];

    const userInstitutions = user?.instituciones || [];

    // Si el usuario no pertenece a ninguna institución, no mostramos resultados
    if (userInstitutions.length === 0) {
      return [];
    }

    const userInstIds = new Set(
      userInstitutions
        .map((inst) => (inst.id ? String(inst.id).trim().toLowerCase() : ""))
        .filter(Boolean)
    );

    const userInstNames = new Set(
      userInstitutions
        .map((inst) => (inst.nombre ? inst.nombre.trim().toLowerCase() : ""))
        .filter(Boolean)
    );

    return objects.filter((pub: any) => {
      const pubInstId = pub.institucion_id
        ? String(pub.institucion_id).trim().toLowerCase()
        : "";

      const pubInstName = pub.institucion_nombre
        ? String(pub.institucion_nombre).trim().toLowerCase()
        : "";

      const pubLocation = pub.lugar_institucion
        ? String(pub.lugar_institucion).trim().toLowerCase()
        : "";

      const matchesId = pubInstId ? userInstIds.has(pubInstId) : false;
      const matchesName = pubInstName ? userInstNames.has(pubInstName) : false;
      const matchesLocation = pubLocation ? userInstNames.has(pubLocation) : false;

      return matchesId || matchesName || matchesLocation;
    });
  }, [objects, user]);

  return (
    <div className="search_page">
      <Header />
      <main className="search_page_content">
        <section className="search_hero">
          <h1 className="search_title">
            Encuentra lo que
            <span> perdiste.</span>
          </h1>
          <div className="search_bar">
            <Search size={22} />
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              className="search_input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <SearchFilters
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            categorias={categorias}
            setCategorias={setCategorias}
            instituciones={instituciones}
            setInstituciones={setInstituciones}
            fechaDesde={fechaDesde}
            setFechaDesde={setFechaDesde}
            fechaHasta={fechaHasta}
            setFechaHasta={setFechaHasta}
            tipo={tipo}
            setTipo={setTipo}
            clearFilters={clearFilters}
          />
        </section>

        {/* Condicional para cuando no hay publicaciones en los filtros */}
        <section className="search_results">
          {filteredObjects.length === 0 ? (
            <div className="no_results_container animate_fade_in">
              <p className="no_results_text">
                No se encontraron publicaciones que coincidan con tus instituciones y filtros aplicados.
              </p>
            </div>
          ) : (
            filteredObjects.map((object: any) => (
              <ObjectCard
                key={object.id}
                id={object.id}
                image={object.foto_principal_url || object.foto || ""}
                title={object.nombre}
                location={object.lugar_institucion || object.institucion_nombre || "Ubicación no especificada"}
                status={object.tipo}
                createdAt={object.fecha_evento || object.created_at}
              />
            ))
          )}
        </section>
        
        <PublishBanner />
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;