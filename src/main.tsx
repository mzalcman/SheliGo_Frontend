import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/fonts.css"; //agregado
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root")!);

/* Sin estas variables el cliente de Supabase falla al cargarse y la pantalla
   queda en blanco: se avisa qué falta antes de cargar la app. */
const VARIABLES_REQUERIDAS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;
const faltantes = VARIABLES_REQUERIDAS.filter((nombre) => !import.meta.env[nombre]?.trim());

if (faltantes.length > 0) {
  root.render(
    <main style={{ maxWidth: 560, margin: "64px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22 }}>Falta configurar el frontend</h1>
      <p>No se encontraron estas variables de entorno:</p>
      <ul>
        {faltantes.map((nombre) => <li key={nombre}><code>{nombre}</code></li>)}
      </ul>
      <p>
        Copiá <code>.env.example</code> como <code>.env</code> en la raíz del proyecto,
        completá los valores y volvé a correr <code>npm run dev</code>.
      </p>
    </main>
  );
} else {
  Promise.all([import("./App"), import("./contexts/auth_context")]).then(
    ([{ default: App }, { AuthProvider }]) => {
      root.render(
        <React.StrictMode>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </React.StrictMode>
      );
    }
  );
}
