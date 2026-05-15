import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/auth_context";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>

    {/* Provider global auth */}
    <AuthProvider>

      <App />

    </AuthProvider>

  </React.StrictMode>
);