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
}

const RecentObjectsCarousel = ({
  objects,
}: RecentObjectsCarouselProps) => {

  return (
    <div className="recent_objects_carousel">

      {objects.map((object) => (

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