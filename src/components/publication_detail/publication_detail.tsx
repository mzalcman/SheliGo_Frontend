import "./publication_detail.css";
import { Share2, CalendarDays, MapPin, School, } from "lucide-react";
import type { Publication, } from "../../types/publication";
import type { PublicationArchive, } from "../../types/publication_archive";
import { format_publication_date, format_publication_time, } from "../../utils/date_formatter";
import PublicationInfoCard from "../publication_info_card/publication_info_card";
import PublicationStatus from "../publication_status/publication_status";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PublicationDetailProps {
  publication: Publication;
  archives: PublicationArchive[];
}

const PublicationDetail = ({
  publication, archives,
}: PublicationDetailProps) => {
  const [copied, set_copied] = useState(false); 

  const ordered_archives = useMemo(
    () =>
      [...archives].sort(
        (a, b) =>
          Number(b.es_principal) -
          Number(a.es_principal)
      ),
    [archives]
  );

  const [current_image, set_current_image] = useState(0);

  const next_image = () => {
    set_current_image(
      (prev) =>
        (prev + 1) %
        ordered_archives.length
    );
  };

  const previous_image = () => {
    set_current_image(
      (prev) =>
        prev === 0
          ? ordered_archives.length - 1
          : prev - 1
    );
  };

  const handle_share = async () => {
    try {
      const current_url = window.location.href;
      await navigator.clipboard.writeText(current_url);
      set_copied(true);
      setTimeout(() => set_copied(false), 2000); // Se oculta a los 2 segundos
    } catch (err) {
      console.error("Error al copiar el link: ", err);
    }
  };

  return (
    <section className="publication_detail">
      <div className="publication_image_container">
        <img
          src={
            ordered_archives[current_image]?.url ||
            "/obj_predeterminada.png"
          }
          alt={publication.nombre}
          className="publication_image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "/obj_predeterminada.png";
          }}
        />
        {ordered_archives.length > 1 && (
          <>
            <button
              className="carousel_button carousel_left"
              onClick={previous_image}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              className="carousel_button carousel_right"
              onClick={next_image}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="publication_header">
          <div>
            {/* Badge estado */}
            <PublicationStatus status={publication.tipo} />
          </div>

          <div style={{ position: "relative" }}>
            <button
              className="publication_share_button"
              onClick={handle_share} 
            >
              <Share2
                size={26}
                strokeWidth={2.2}
              />
            </button>

            {copied && <span className="share_copied_toast">¡Link copiado!</span>}
          </div>
        </div>
      </div>

      {ordered_archives.length > 1 && (
        <div className="carousel_indicators">
          {ordered_archives.map((_, index) => (
            <button
              key={index}
              type="button"
              className={
                index === current_image
                  ? "carousel_dot active"
                  : "carousel_dot"
              }
              onClick={() =>
                set_current_image(index)
              }
            />
          ))}
        </div>
      )}

      <section className="publication_section">
        <h1 className="publication_title">
          {publication.nombre}
        </h1>
        <h2 className="publication_section_title">
          Descripción
        </h2>
        <div className="publication_box">
          {publication.descripcion}
        </div>
      </section>

      <PublicationInfoCard
        title="CUANDO"
        icon={CalendarDays}
        icon_background="#FF6F00"
        main_text={
          format_publication_date(
            publication.fecha_evento
          )
        }
        secondary_text={
          format_publication_time(
            publication.created_at
          )
        }
      />

      <PublicationInfoCard
        title="DONDE"
        icon={MapPin}
        icon_background="#FFC107"
        main_text={
          publication.lugar_institucion
        }
      />

      <PublicationInfoCard
        title="INSTITUCIÓN"
        icon={School}
        icon_background="#FF6F00"
        main_text={
          publication.institucion_nombre
        }
        secondary_text={
          publication.institucion_direccion
        }
      />

      {publication.latitud != null &&
        publication.longitud != null && (
          <section className="publication_section">
            <h2 className="publication_section_title">
              Ubicación
            </h2>
            <div className="location_card">
              <iframe
                title="Ubicación"
                src={`https://maps.google.com/maps?q=${publication.latitud},${publication.longitud}&z=17&output=embed`}
                className="location_map"
                loading="lazy"
              />
            </div>
          </section>
        )}

      <section className="publication_section">
        <h2 className="publication_section_title">
          Publicado por
        </h2>
        <div className="publisher_card">
          <img
            src={
              publication.usuario_foto ||
              "/images/user_placeholder.png"
            }
            alt={`${publication.usuario_nombre} ${publication.usuario_apellido}`}
            className="publisher_image"
          />
          <div className="publisher_info">
            <h3 className="publisher_name">
              {publication.usuario_nombre}{" "}
              {publication.usuario_apellido}
            </h3>
          </div>
        </div>
      </section>
    </section>
  );
};

export default PublicationDetail;