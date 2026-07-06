import "./publish_banner.css";
import { useNavigate } from "react-router-dom";

const PublishBanner = () => {
const navigate = useNavigate();
  return (
    <section className="publish_banner">

  <div className="publish_banner_content">

    <h2>
      ¿Encontraste o perdiste algo?
    </h2>

    <button
      className="banner_publish_button"
      onClick={() => navigate("/publicar")}
      >
      Publicar
    </button>

  </div>

  <div className="publish_banner_circle" />

</section>
  );
};

export default PublishBanner;