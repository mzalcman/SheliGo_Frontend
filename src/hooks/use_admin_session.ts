import { useContext } from "react";
import { AdminSessionContext } from "../contexts/admin_session_context";

export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);
  if (!context) throw new Error("useAdminSession debe usarse dentro de AdminSessionProvider");
  return context;
};
