import "./loader.css";

const Loader = () => {
  return (
    <div className="loader_container" role="status">
      <div className="loader_ring">
        <div className="loader_spinner" />
        <img src="/logo_sheligo.png" alt="" className="loader_mark" />
      </div>
      <p>Cargando...</p>
    </div>
  );
};

export default Loader;
