import "./app.css";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";
import SearchPage from "./pages/search_page/search_page";
import PublishPage from "./pages/publish_page/publish_page";
import LandingPage from "./pages/landing_page/landing_page";
import MenuPage from "./pages/menu_page/menu_page";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/home"
          element={<LandingPage />}
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

        <Route
          path="/menu"
          element={<MenuPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;