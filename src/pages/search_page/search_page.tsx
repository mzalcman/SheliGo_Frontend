import "./search_page.css";

import { useState } from "react";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

import SearchInput from "../../components/search_input/search_input";
import FilterChip from "../../components/filter_chip/filter_chip";
import PublishBanner from "../../components/publish_banner/publish_banner";
import ObjectCard from "../../components/object_card/object_card";

import { mock_search_objects }
from "../../data/mock_search_objects";

const SearchPage = () => {

  const [search, set_search] = useState("");

  const filtered_objects =
    mock_search_objects.filter(
      (object) =>
        object.nombre
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (

    <div className="search_page">

      <Header />

      <main className="search_page_content">

        <section className="search_hero">

          <h1 className="search_title">

            Encuentra lo que
            <span> perdiste.</span>

          </h1>

        </section>

        <SearchInput
          value={search}
          onChange={set_search}
        />

        <section className="filters_container">

          <FilterChip
            label="Categoría"
            onClick={() => {}}
          />

          <FilterChip
            label="Institución"
            onClick={() => {}}
          />

          <FilterChip
            label="Lugar"
            onClick={() => {}}
          />

          <FilterChip
            label="Fecha"
            onClick={() => {}}
          />

          <FilterChip
            label="Perdido"
            onClick={() => {}}
          />

          <FilterChip
            label="Encontrado"
            onClick={() => {}}
          />

        </section>

        <section className="objects_container">

          {filtered_objects.map(
            (object) => (

              <ObjectCard
                key={object.id}
                id={object.id}
                image={object.foto}
                title={object.nombre}
                location={object.lugar}
                status={object.estado}
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