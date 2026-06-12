import "./publish_banner.css";

const PublishBanner = () => {

  return (
    <section className="publish_banner">

  <div className="publish_banner_content">

    <h2>
      ¿Encontraste algo y querés devolverlo?
    </h2>

    <button
      className="banner_publish_button">
      Publicar Hallazgo
    </button>

  </div>

  <div className="publish_banner_circle" />

</section>
  );
};

export default PublishBanner;