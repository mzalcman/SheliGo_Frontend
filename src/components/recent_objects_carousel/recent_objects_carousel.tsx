import "./recent_objects_carousel.css";
import ObjectCard from "../object_card/object_card";

interface ObjectType {
  id: number;
  image: string;
  title: string;
  location: string;
  status: string;
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
          image={object.image}
          title={object.title}
          location={object.location}
          status={object.status}
        />

      ))}

    </div>
  );
};

export default RecentObjectsCarousel;