import "./publication_detail.css";
import { Share2 } from "lucide-react";
import type { Publication } from "../../types/publication";
import {format_publication_date, format_publication_time, } from "../../utils/date_formatter";
import {CalendarDays, MapPin, School, } from "lucide-react";
import PublicationInfoCard from "../publication_info_card/publication_info_card";
import PublicationStatus from "../publication_status/publication_status";

interface PublicationDetailProps {
  publication: Publication;
}

const PublicationDetail = ({
  publication,
}: PublicationDetailProps) => {
  return (

    <section className="publication_detail">

{/* Contenedor imagen + overlay */}
<div className="publication_image_container">
  <img
    src={publication.imagen_url}
    alt={publication.nombre}
    className="publication_image"
  />
  {/* Overlay superior */}
  <div className="publication_header">

    <div>
      <PublicationStatus status={publication.tipo}/>

      <h1 className="publication_title">
        {publication.nombre}
      </h1>

    </div>

    <button className="publication_share_button">
      <Share2 size={26} strokeWidth={2.2} />
    </button>
  </div>
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