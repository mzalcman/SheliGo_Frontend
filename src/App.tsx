import "./app.css";
import { useEffect } from "react";
import HomePage from "./pages/home_page/home_page";
import PublicationDetailPage from "./pages/publication_detail_page/publication_detail_page";
import SearchPage from "./pages/search_page/search_page";
import PublishPage from "./pages/publish_page/publish_page";
import LandingPage from "./pages/landing_page/landing_page";
import MenuPage from "./pages/menu_page/menu_page";
import LoginPage from "./pages/login_page/login_page";
import RegisterPage from "./pages/register_page/register_page";
import HelpPage from "./pages/help_page/help_page";
import EditPublicationPage from "./pages/edit_publication_page/edit_publication_page";
import ProtectedRoute from "./components/protected_route/protected_route"; 
import { Routes, Route } from "react-router-dom";
import ChatsListPage from "./pages/chats_list_page/chats_list_page"; 
import ChatRoomPage from "./pages/chat_room_page/chat_room_page";
import MyPublicatiosPage from "./pages/my_publications_page/my_publications_page";
import PrivacySecurityPage from "./pages/PrivacySecurityPage/PrivacySecurityPage"; 

// Pantalla de contáctanos
import ContactPage from "./pages/contact_page/ContactPage";

// IMPORTS DE RUTAS DE PERFIL Y CONFIGURACIÓN
import ProfilePage from "./pages/profile/ProfilePage";
import PersonalInfoPage from "./pages/personal_info/PersonalInfoPage";
import ChangePasswordPage from "./pages/change_password_page/change_password_page";

function App() {

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith("/publicacion/")) {
      localStorage.setItem("redirect_after_login", currentPath);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/buscar" element={<SearchPage />} />
      <Route path="/ayuda" element={<HelpPage />} />
      <Route path="/contactanos" element={<ContactPage />} />
      <Route path="/privacidad-y-seguridad" element={<PrivacySecurityPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/publicacion/:id" element={<PublicationDetailPage />} />
        <Route path="/publicar" element={<PublishPage />} />
        <Route path="/publicaciones/editar/:id" element={<EditPublicationPage />} />
        <Route path="/chats" element={<ChatsListPage />} />
        <Route path="/chat/:salaId" element={<ChatRoomPage />} />
        <Route path="/mispublicaciones" element={<MyPublicatiosPage />} />
        <Route path="/menu" element={<MenuPage />} />
        {/* RUTAS PROTEGIDAS DEL PERFIL Y CONFIGURACIÓN */}
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/perfil/informacion-personal" element={<PersonalInfoPage />} />
        <Route path="/cambiar-contrasena" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  );
}

export default App;