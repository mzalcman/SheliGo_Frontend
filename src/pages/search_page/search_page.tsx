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
  const [categoria, setCategoria] =  useState("");
  const [institucion, setInstitucion] =  useState("");
  const [lugar, setLugar] =  useState("");
  const [fecha, setFecha] =  useState("");
  const [tipo, setTipo] =  useState("");
  
  useEffect(() => {
    const buscar = async () => {

      try {

        const publicaciones =
          await searchPublications({
            busqueda:
              searchText || undefined,
            categoria_id:
              categoria || undefined,
            institucion_id:
              institucion || undefined,
            lugar_institucion:
              lugar || undefined,
            fecha:
              fecha || undefined,
            tipo:
              tipo || undefined,
          });

        setObjects(publicaciones);

      } catch (error) {

        console.error(error);

      }

    };

    buscar();

  }, [
    searchText,
    categoria,
    institucion,
    lugar,
    fecha,
    tipo,
  ]);

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
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
            />

          </div>

          <SearchFilters
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}

            categoria={categoria}
            setCategoria={setCategoria}

            institucion={institucion}
            setInstitucion={setInstitucion}

            lugar={lugar}
            setLugar={setLugar}

            fecha={fecha}
            setFecha={setFecha}

            tipo={tipo}
            setTipo={setTipo}
          />

        </section>

        <section className="search_results">

          {objects.map((object: any) => (

            <ObjectCard
              key={object.id}
              id={object.id}
              image={object.foto_principal_url}
              title={object.nombre}
              location={object.lugar_institucion}
              status={object.tipo}
            />

          ))}

        </section>
        <PublishBanner />
      </main>
      <Footer />
    </div>

  );

};

export default SearchPage;