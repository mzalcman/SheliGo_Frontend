import "./publish_banner.css";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const PublishBanner = () => {
  const navigate = useNavigate();
  return (
    <section className="publish_banner">
      <div className="publish_banner_content">
        <span className="publish_banner_eyebrow">Porque lo tuyo vuelve</span>
        <h2>¿Encontraste o perdiste algo?</h2>

        <button
          className="btn btn_secondary"
          onClick={() => navigate("/publicar")}
        >
          <Plus size={18} strokeWidth={2.4} />
          Publicar
        </button>
      </div>

      <img src="/logo_sheligo.png" alt="" className="publish_banner_mark" />
    </section>
  );
};

export default PublishBanner;
