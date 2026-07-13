import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/fonts.css"; //agregado
import "./index.css";
import { AuthProvider } from "./contexts/auth_context";
import { BrowserRouter } from "react-router-dom";


ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);