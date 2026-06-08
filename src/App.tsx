import "./app.css";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";
import LandingPage from "./pages/landing_page/landing_page";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/home"
          element={<HomePage />}
        />

        <Route
          path="/publicacion/:id"
          element={<PublicationDetailPage />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;