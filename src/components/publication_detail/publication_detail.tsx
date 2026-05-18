import "./publication_detail.css";
import { Share2 } from "lucide-react";
import type { Publication } from "../../types/publication";
import {format_publication_date, format_publication_time, } from "../../utils/date_formatter";
import {CalendarDays, MapPin, School, } from "lucide-react";
import PublicationInfoCard from "../publication_info_card/publication_info_card";

interface PublicationDetailProps {
  publication: Publication;
}

const PublicationDetail = ({
  publication,
}: PublicationDetailProps) => {

  // Color dinámico según tipo
  const badge_class =
    publication.tipo === "perdido"
      ? "publication_status_lost"
      : "publication_status_found";

  return (

    <section className="publication_detail">

      {/* Imagen principal */}
      <img
        src={publication.imagen_url}
        alt={publication.nombre}
        className="publication_image"
      />

      {/* Header interno */}
      <div className="publication_header">

        <div>

          {/* Nombre */}
          <h1 className="publication_title">
            {publication.nombre}
          </h1>

          {/* Estado */}
          <div className={badge_class}>
            {publication.tipo}
          </div>

        </div>

        {/* Compartir */}
        {/* Visual solamente */}
        <button className="publication_share_button">

          <Share2
            size={28}
            strokeWidth={2.2}
          />

        </button>

      </div>

      {/* Descripción */}
      <section className="publication_section">
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
  main_text={ format_publication_date( publication.fecha_evento)}
  secondary_text={ format_publication_time(publication.created_at)}
/>

<PublicationInfoCard
  title="DONDE"
  icon={MapPin}
  icon_background="#FFC107"
  main_text={ publication.ubicacion}
  secondary_text={publication.direccion}
/>

<PublicationInfoCard
  title="INSTITUCIÓN"
  icon={School}
  icon_background="#FF6F00"
  main_text={ publication.institucion}
  secondary_text={ publication .institucion_direccion }/>
    </section>

  );
};

export default PublicationDetail;