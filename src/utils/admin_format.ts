const date_format = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
const date_time_format = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const relative_format = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/* Fechas del calendario (fecha_evento, fecha_union): son el día que se eligió, no un
   instante. Se muestran en UTC para que la zona horaria del navegador no las cambie. */
const calendar_date_format = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const calendar_date_time_format = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const to_date = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const format_admin_date = (value: string | null | undefined) => {
  const date = to_date(value);
  return date ? date_format.format(date) : "—";
};

export const format_admin_date_time = (value: string | null | undefined) => {
  const date = to_date(value);
  return date ? date_time_format.format(date) : "—";
};

export const format_admin_calendar_date = (value: string | null | undefined) => {
  const date = to_date(value);
  return date ? calendar_date_format.format(date) : "—";
};

export const format_admin_calendar_date_time = (value: string | null | undefined) => {
  const date = to_date(value);
  return date ? calendar_date_time_format.format(date) : "—";
};

// "hace 5 minutos", "ayer", "hace 3 días"
export const format_admin_relative = (value: string | null | undefined) => {
  const date = to_date(value);
  if (!date) return "—";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative_format.format(Math.round(seconds / size), unit);
  }
  return "recién";
};

export const full_name = (nombre: string | null | undefined, apellido: string | null | undefined) =>
  [nombre, apellido].filter((part) => part && part.trim()).join(" ").trim();

export const plural = (count: number, singular: string, plural_form: string) =>
  `${count} ${count === 1 ? singular : plural_form}`;