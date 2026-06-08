import "./app.css";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";
import SearchPage from "./pages/search_page/search_page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublishPage from "./pages/publish_page/publish_page";
function App() {

  // TEMPORAL:
  // Elegimos qué pantalla probar

  return (

    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/publicacion/:id"
          element={<PublicationDetailPage />}
        />
        <Route
          path="/buscar"
          element={<SearchPage />}
        />
        <Route
          path="/publicar"
          element={<PublishPage />}
        />
      </Routes>
    </BrowserRouter>

  );

}

export default App;