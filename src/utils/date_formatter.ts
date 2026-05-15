// Formatea la fecha principal.

export const format_publication_date = (
  date_string: string
) => {

  const date = new Date(date_string);

  return date.toLocaleDateString(
    "es-AR",
    {
      weekday: "long",

      day: "numeric",

      month: "long",

      year: "numeric",
    }
  );
};

// Formatea horario.

export const format_publication_time = (
  date_string: string
) => {

  const date = new Date(date_string);

  const formatted_time =
    date.toLocaleTimeString(
      "es-AR",
      {
        hour: "2-digit",

        minute: "2-digit",
      }
    );

  return `Aproximadamente a las ${formatted_time}hs`;
};