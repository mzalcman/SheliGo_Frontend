import "./app.css";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";
import LandingPage from "./pages/landing_page/landing_page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/menu_page/menu_page";

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
          element={<HomePage />}
        />

        <Route
          path="/publicacion/:id"
          element={<PublicationDetailPage />}
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