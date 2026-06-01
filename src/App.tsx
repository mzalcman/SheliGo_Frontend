import "./app.css";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";

function App() {

  // TEMPORAL:
  // Elegimos qué pantalla probar

  return (

    <div className="app">

      {/* Home */}
      {/* <HomePage />*/}

      {/* Detalle publicación */}
      <PublicationDetailPage />

    </div>

  );

}

export default App;