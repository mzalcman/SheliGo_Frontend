import "./publication_status.css";

interface PublicationStatusProps {
  status: string;
  // publicaciones.estado: una publicación recuperada se muestra como tal
  estado?: string;
  small?: boolean;
}

/* Si no llega, después le damos un valor por defecto.
  Lo usamos para reutilizar el mismo componente en distintos lugares:
  small = true
  → versión chica (cards)
  small = false
  → versión grande (detalle) */

const PublicationStatus = ({ status,
  estado,
  small = false,
}: PublicationStatusProps) => {

  const normalized_status = status.toLowerCase();

  /* Si el estado es:
  encontrado
  → amarillo
  cualquier otro caso
  → perdido (naranja)*/

  const is_recovered = estado === "recuperada";

  const status_class = is_recovered
    ? "publication_status_recovered"
    : normalized_status === "encontrado"
      ? "publication_status_found"
      : "publication_status_lost";

  const size_class =
    small
      ? "publication_status_small"
      : "publication_status_large";

  return (
    <div className={`publication_status ${status_class} ${size_class}`}>
      <span className="publication_status_dot" />
      {is_recovered ? "recuperado" : status}
    </div>
  );
};

export default PublicationStatus;
