import "./publication_detail.css";
import {Share2,CalendarDays,MapPin,School,} from "lucide-react";
import type {Publication,} from "../../types/publication";
import type {PublicationArchive,} from "../../types/publication_archive";
import {format_publication_date,format_publication_time,} from "../../utils/date_formatter";
import PublicationInfoCard from "../publication_info_card/publication_info_card";
import PublicationStatus from "../publication_status/publication_status";
import {MapContainer, TileLayer, Marker,  Popup,} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface PublicationDetailProps {
  publication: Publication;
  archives: PublicationArchive[];
}

const PublicationDetail = ({
  publication, archives,
}: PublicationDetailProps) => {
  return (

    <section className="publication_detail">
      <div className="publication_image_container">
        <img
          src={
          archives[0]?.url || "/images/object_placeholder.png"}
          alt={publication.nombre} className="publication_image"/>
      
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

          <button
            className="publication_share_button">

            <Share2
              size={26}
              strokeWidth={2.2}/>
          </button>
        </div>
      </div>

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
      />
<section className="publication_section">

  <h2 className="publication_section_title">
    Ubicación Exacta
  </h2>

  <div className="location_card">

    <div className="location_badge">
      UBICACIÓN EXACTA
    </div>

    <MapContainer
      center={[
        publication.latitud,
        publication.longitud,
      ]}
      zoom={17}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={true}
      className="location_map"
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[
          publication.latitud,
          publication.longitud,
        ]}
      />
    </MapContainer>

  </div>

</section>

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