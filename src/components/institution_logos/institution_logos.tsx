import "./institution_logos.css";

interface Institution {
  id: string;
  foto: string;
  nombre: string;
}

interface InstitutionLogosProps {
  institutions: Institution[];
  limit?: number; 
}

const InstitutionLogos = ({
  institutions,
  limit, 
}: InstitutionLogosProps) => {
  
  const displayedInstitutions = limit ? institutions.slice(0, limit) : institutions;

  return (
    <div className="institution_logos">
      {displayedInstitutions.map((institution) => (
        <div
          key={institution.id}
          className="institution_item"
        >
          <div className="institution_logo_container">
            <img
              src={institution.foto || "/obj_predeterminada.png"}
              alt={institution.nombre}
              className="institution_logo"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "/obj_predeterminada.png";
              }}
            />
          </div>

          <span className="institution_name">
            {institution.nombre}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InstitutionLogos;