import "./recent_objects_carousel.css";
import ObjectCard from "../object_card/object_card";

interface ObjectType {
  id: string;
  nombre: string;
  lugar_institucion: string;
  tipo: string;
  foto_principal_url: string;
}

interface RecentObjectsCarouselProps {
  objects: ObjectType[];
  limit?: number;
}

const RecentObjectsCarousel = ({
  objects,
  limit,
}: RecentObjectsCarouselProps) => {
  if (!objects || objects.length === 0) {
    return (
      <div className="recent_objects_empty">
        <p className="empty_message_text">No hay objetos recientes en este momento.</p>
      </div>
    );
  }

  const displayedObjects = limit ? objects.slice(0, limit) : objects;

  return (
    <div className="recent_objects_carousel">
      {displayedObjects.map((object) => (
        <ObjectCard
          key={object.id}
          id={object.id}
          image={object.foto_principal_url}
          title={object.nombre}
          location={object.lugar_institucion}
          status={object.tipo}
        />
      ))}
    </div>
  );
};

export default RecentObjectsCarousel;