import { useNavigate } from "react-router-dom";
import { RotateCw, ShieldAlert } from "lucide-react";
import BrandLogo from "../../../components/brand_logo/brand_logo";
import "./admin_forbidden_page.css";

interface AdminForbiddenPageProps {
  message: string;
  // Solo se ofrece reintentar cuando el error no fue un 403 definitivo
  on_retry?: (() => void) | undefined;
}

const AdminForbiddenPage = ({ message, on_retry }: AdminForbiddenPageProps) => {
  const navigate = useNavigate();

  return (
    <main className="admin_forbidden">
      <div className="admin_forbidden_card animate_fade_in">
        <BrandLogo size="sm" />
        <div className="admin_forbidden_icon">
          <ShieldAlert size={30} strokeWidth={2} />
        </div>
        <h1 className="admin_forbidden_title">
          {on_retry ? "No pudimos abrir el backoffice" : "No tenés acceso al backoffice"}
        </h1>
        <p className="admin_forbidden_text">{message}</p>
        <div className="admin_forbidden_actions">
          {on_retry && (
            <button className="btn btn_secondary btn_block" onClick={on_retry}>
              <RotateCw size={18} />
              Reintentar
            </button>
          )}
          <button className="btn btn_primary btn_block" onClick={() => navigate("/home")}>
            Volver a SheliGo
          </button>
        </div>
      </div>
    </main>
  );
};

export default AdminForbiddenPage;
