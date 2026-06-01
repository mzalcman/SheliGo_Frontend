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
          className="institution_logo_container"
        >
          <img
            src={institution.foto}
            alt={institution.nombre}
            className="institution_logo"
          />
        </div>
      ))}
    </div>
  );
};

export default InstitutionLogos;