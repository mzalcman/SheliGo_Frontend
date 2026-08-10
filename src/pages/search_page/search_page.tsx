import "./search_page.css";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import PublishBanner from "../../components/publish_banner/publish_banner";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ObjectCard from "../../components/object_card/object_card";
import SearchFilters from "../../components/search_filters/search_filters";
import { searchPublications } from "../../services/search_service";

const SearchPage = () => {
  const [objects, setObjects] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [openFilter, setOpenFilter] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [instituciones, setInstituciones] = useState<string[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tipo, setTipo] = useState("");

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
        setObjects(publicaciones);
      } catch (error) {
        console.error(error);
      }
    };
    buscar();
  }, [searchText, categorias, instituciones, fechaDesde, fechaHasta, tipo]);

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

        {/*Condicional para cuando no hay publicaciones en los filtros */}
        <section className="search_results">
          {objects.length === 0 ? (
            <div className="no_results_container animate_fade_in">
              <p className="no_results_text">
                No se encontraron publicaciones que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            objects.map((object: any) => (
              <ObjectCard
                key={object.id}
                id={object.id}
                image={object.foto_principal_url}
                title={object.nombre}
                location={object.lugar_institucion}
                status={object.tipo}
                createdAt={object.fecha_evento}
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