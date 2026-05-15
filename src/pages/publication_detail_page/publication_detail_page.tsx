import "./publication_detail_page.css";

import Header from "../../components/header/header";

import Footer from "../../components/footer/footer";

import { mock_publication } from "../../data/mock_publication";

// Página principal detalle publicación.
// Más adelante recibirá ID desde React Router.

const PublicationDetailPage = () => {

  return (

    <div className="publication_detail_page">

      {/* Header superior */}
      <Header />

      {/* Contenido scrolleable */}
      <main className="publication_detail_content">

        {/* 
          Acá luego vamos a renderizar:
          - imagen
          - badge estado
          - descripción
          - cards info
          - preguntas
          - botón reclamar
        */}

        <h1>
          {mock_publication.nombre}
        </h1>

      </main>

      {/* Footer fijo */}
      <Footer />

    </div>
  );
};

export default PublicationDetailPage;