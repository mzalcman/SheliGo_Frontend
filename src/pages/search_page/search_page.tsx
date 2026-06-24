import "./search_page.css";
import { useState } from "react";
import { Search } from "lucide-react";
import PublishBanner from "../../components/publish_banner/publish_banner";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ObjectCard from "../../components/object_card/object_card";
import SearchFilters from "../../components/search_filters/search_filters";

const SearchPage = () => {

  const [searchText, setSearchText] =
    useState("");

  const [openFilter, setOpenFilter] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [institucion, setInstitucion] =
    useState("");

  const [lugar, setLugar] =
    useState("");

  const [fecha, setFecha] =
    useState("");

  const [tipo, setTipo] =
    useState("");

  // TEMPORAL
  // Después vendrá del backend

  const objects = [
    {
      id: "1",
      nombre: "Bolso de Cuero",
      categoria: "Mochilas",
      institucion: "Club SheliGo",
      lugar: "Cafetería central",
      fecha: "2026",
      tipo: "encontrado",
      foto:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
    },

    {
      id: "2",
      nombre: "Cargador Apple",
      categoria: "Electrónica",
      institucion: "ORT",
      lugar: "Comedor",
      fecha: "2025",
      tipo: "perdido",
      foto:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0",
    },

    {
      id: "3",
      nombre: "Mochila Adidas",
      categoria: "Mochilas",
      institucion: "Club SheliGo",
      lugar: "Baño sede",
      fecha: "2026",
      tipo: "perdido",
      foto:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    },
  ];

  const filteredObjects =
    objects.filter((object) => {

      const matchesText =
        object.nombre
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          );

      const matchesCategoria =
        !categoria ||
        object.categoria === categoria;

      const matchesInstitucion =
        !institucion ||
        object.institucion === institucion;

      const matchesLugar =
        !lugar ||
        object.lugar === lugar;

      const matchesFecha =
        !fecha ||
        object.fecha === fecha;

      const matchesTipo =
        !tipo ||
        object.tipo === tipo;

      return (
        matchesText &&
        matchesCategoria &&
        matchesInstitucion &&
        matchesLugar &&
        matchesFecha &&
        matchesTipo
      );
    });


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

          {filteredObjects.map(
            (object) => (
              <ObjectCard
                key={object.id}
                id={object.id}
                image={object.foto}
                title={object.nombre}
                location={object.lugar}
                status={object.tipo}
              />
            )
          )}

        </section>

        <PublishBanner />

      </main>

      <Footer />

    </div>
  );
};

export default SearchPage;