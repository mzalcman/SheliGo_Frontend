import "./institution_autocomplete.css";

interface Institution {
  id: string;
  nombre: string;
}

interface Props {
  value: string;
  onChange: (
    value: string
  ) => void;

  institutions: Institution[];
}

const InstitutionAutocomplete = ({
  value,
  onChange,
  institutions,
}: Props) => {

  const filteredInstitutions =
    institutions.filter(
      (institution) =>
        institution.nombre
          .toLowerCase()
          .includes(
            value.toLowerCase()
          )
    );

  return (
    <div className="autocomplete_container">

      <input
        className="publish_input"
        placeholder="Escribe la institución"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />

      {value && (

        <div className="autocomplete_dropdown">

          {filteredInstitutions.map(
            (institution) => (

              <button
                key={institution.id}
                className="autocomplete_item"
                onClick={() =>
                  onChange(
                    institution.nombre
                  )
                }
              >
                {institution.nombre}
              </button>
            )
          )}

        </div>

      )}

    </div>
  );
};

export default InstitutionAutocomplete;