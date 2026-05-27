import "./publication_status.css";

interface PublicationStatusProps {

  status: string;

  small?: boolean;
}

/*
small=true
→ cards home

small=false
→ detalle publicación
*/

const PublicationStatus = ({
  status,
  small = false,
}: PublicationStatusProps) => {

  const normalized_status =
    status.toLowerCase();

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
        ${size_class}
      `}
    >

      {status}

    </div>

  );
};

export default PublicationStatus;