import "./app.css";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";
import SearchPage from "./pages/search_page/search_page";
import PublishPage from "./pages/publish_page/publish_page";
import LandingPage from "./pages/landing_page/landing_page";
import MenuPage from "./pages/menu_page/menu_page";
import LoginPage from "./pages/login_page/login_page";
import RegisterPage from "./pages/register_page/register_page";
import ProtectedRoute from "./components/protected_route/protected_route"; 
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/buscar" element={<SearchPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/publicacion/:id" element={<PublicationDetailPage />} />
        <Route path="/publicar" element={<PublishPage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Route>
    </Routes>
  );
}

export default App;