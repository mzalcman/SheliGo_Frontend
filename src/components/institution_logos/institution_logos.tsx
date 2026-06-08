import "./institution_logos.css";

interface Institution {
  id: string;
  foto: string;
  nombre: string;
}

interface InstitutionLogosProps {
  institutions: Institution[];
}

const InstitutionLogos = ({
  institutions,
}: InstitutionLogosProps) => {
  return (
    <div className="institution_logos">
      {institutions.map((institution) => (
        <div
          key={institution.id}
          className="institution_item"
        >
          <div className="institution_logo_container">
            <img
              src={institution.foto}
              alt={institution.nombre}
              className="institution_logo"
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