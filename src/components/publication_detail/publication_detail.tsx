import "./publication_detail.css";

import {
  Share2,
  CalendarDays,
  MapPin,
  School,
} from "lucide-react";

import type {
  Publication,
} from "../../types/publication";

import type {
  PublicationArchive,
} from "../../types/publication_archive";

import {
  format_publication_date,
  format_publication_time,
} from "../../utils/date_formatter";

import PublicationInfoCard
from "../publication_info_card/publication_info_card";

import PublicationStatus
from "../publication_status/publication_status";

interface PublicationDetailProps {

  publication: Publication;

  archives:
    PublicationArchive[];
}

const PublicationDetail = ({

  publication,

  archives,

}: PublicationDetailProps) => {

  return (

    <section className="publication_detail">

      {/* Imagen + overlay */}
      <div className="publication_image_container">

        <img

          /*
          Temporal.

          Más adelante:
          backend devolverá
          URL completa
          desde Supabase Storage.
          */
          src={

            archives[0]?.url

              ? `http://localhost:3000/${archives[0].url}`

              : "/images/object_placeholder.png"
          }

          alt={publication.nombre}

          className="publication_image"
        />

        {/* Overlay superior */}
        <div className="publication_header">

          <div>

            {/* Badge estado */}
            <PublicationStatus
              status={publication.tipo}
            />

            {/* Nombre objeto */}
            <h1 className="publication_title">

              {publication.nombre}

            </h1>

          </div>

          {/* Share */}
          <button
            className="
            publication_share_button
          "
          >

            <Share2
              size={26}
              strokeWidth={2.2}
            />

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

      {/* Cuando */}
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

      {/* Donde */}
      <PublicationInfoCard

        title="DONDE"

        icon={MapPin}

        icon_background="#FFC107"

        main_text={
          publication.lugar_institucion
        }
      />

      {/* Institución */}
      <PublicationInfoCard

        title="INSTITUCIÓN"

        icon={School}

        icon_background="#FF6F00"

        main_text={
          publication.institucion_nombre
        }
      />

    </section>
  );
};

export default PublicationDetail;