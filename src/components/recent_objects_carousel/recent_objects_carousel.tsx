import "./recent_objects_carousel.css";
import ObjectCard from "../object_card/object_card";
import EmptyState from "../empty_state/empty_state";
import { PackageSearch } from "lucide-react";

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
      <EmptyState
        icon={PackageSearch}
        title="No hay objetos recientes en este momento."
        description="Cuando alguien publique un objeto perdido o encontrado, lo vas a ver acá."
        compact
      />
    );
  }

  const displayedObjects = limit ? objects.slice(0, limit) : objects;

  return (
    <div className="recent_objects_carousel no_scrollbar">
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