import "./search_page.css";
import { useEffect, useState, useMemo } from "react";
import { Search, SearchX } from "lucide-react";
import EmptyState from "../../components/empty_state/empty_state";
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
  // null = sin elección propia: el filtro arranca con las instituciones del usuario
  const [institucionesElegidas, setInstitucionesElegidas] = useState<string[] | null>(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tipo, setTipo] = useState("");

  const { user } = useAuth() as { user: User | null };

  const institucionesDelUsuario = useMemo(
    () => (user?.instituciones || []).map((inst) => String(inst.id)),
    [user]
  );

  // Lo tildado en el filtro es exactamente lo que se consulta al backend.
  // Desmarcar todas vuelve al valor por defecto (las instituciones del usuario),
  // que es también lo que el backend usa cuando no recibe institucion_id.
  const instituciones = institucionesElegidas ?? institucionesDelUsuario;
  const setInstituciones = (value: string[]) =>
    setInstitucionesElegidas(value.length > 0 ? value : null);

  const clearFilters = () => {
    setSearchText("");
    setCategorias([]);
    setInstitucionesElegidas(null);
    setFechaDesde("");
    setFechaHasta("");
    setTipo("");
    setOpenFilter("");
  };

  useEffect(() => {
    // Evita que una respuesta vieja pise la de filtros más nuevos
    let vigente = true;
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
        if (vigente) setObjects(publicaciones || []);
      } catch (error) {
        console.error("Error al buscar publicaciones:", error);
      }
    };
    buscar();
    return () => {
      vigente = false;
    };
  }, [searchText, categorias, instituciones, fechaDesde, fechaHasta, tipo]);

  return (
    <div className="search_page">
      <Header />
      <main className="page_container">
        <section className="search_hero">
          <span className="eyebrow">Buscar</span>
          <h1 className="search_title">
            Encuentra lo que
            <span> perdiste.</span>
          </h1>
          <div className="search_bar">
            <Search size={20} strokeWidth={2.2} />
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
          {objects.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description="No se encontraron publicaciones que coincidan con las instituciones y filtros aplicados."
            />
          ) : (
            objects.map((object: any) => (
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