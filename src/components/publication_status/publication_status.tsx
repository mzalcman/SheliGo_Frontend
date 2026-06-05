import "./publication_status.css";

interface PublicationStatusProps {
  status: string;
  small?: boolean;
}

/* Si no llega, después le damos un valor por defecto.
  Lo usamos para reutilizar el mismo componente en distintos lugares:
  small = true
  → versión chica (home)
  small = false
  → versión grande (detalle) */

const PublicationStatus = ({ status,
  small = false,
}: PublicationStatusProps) => {

  const normalized_status = status.toLowerCase(); 

  /* Si el estado es:
  encontrado
  → amarillo
  cualquier otro caso
  → perdido (naranja)*/

  const status_class =
    normalized_status ===
    "encontrado"
      ? "publication_status_found"
      : "publication_status_lost";

  const size_class =
    small
      ? "publication_status_small"
      : "publication_status_large";

  return (
    <div
      className={`
        publication_status
        ${status_class}
        ${size_class}`}
    >
      {status}
    </div>

  );
};

export default PublicationStatus;