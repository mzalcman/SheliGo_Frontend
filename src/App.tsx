import Header from "./components/header/header";

import Footer from "./components/footer/footer";

import HomePage from "./pages/home_page/home_page";

function App() {

  return (
    <div>

      {/* Layout global */}
      <Header />

      {/* Contenido dinámico */}
      <HomePage />

      {/* Navegación global */}
      <Footer />

    </div>
  );
}

export default App;