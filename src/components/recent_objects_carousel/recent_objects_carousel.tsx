import { useMemo } from "react";
import "./recent_objects_carousel.css";
import ObjectCard from "../object_card/object_card";
import EmptyState from "../empty_state/empty_state";
import { PackageSearch } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";
import type { Publication } from "../../types/publication";
import type { User } from "../../types/user";

// Extendemos opcionalmente Publication si el backend envía fotos dinámicamente
export interface ExtendedPublication extends Publication {
  foto_principal_url?: string;
  foto?: string;
}

interface RecentObjectsCarouselProps {
  objects: ExtendedPublication[];
  limit?: number;
}

const RecentObjectsCarousel = ({
  objects,
  limit,
}: RecentObjectsCarouselProps) => {
  const { user } = useAuth() as { user: User | null };

  const filteredObjects = useMemo(() => {
    if (!objects || objects.length === 0) return [];

    const userInstitutions = user?.instituciones || [];

    if (userInstitutions.length === 0) {
      return [];
    }

    const userInstIds = new Set(
      userInstitutions.map((inst) => String(inst.id).trim())
    );
    const userInstNames = new Set(
      userInstitutions.map((inst) => inst.nombre.toLowerCase().trim())
    );

    return objects.filter((pub) => {
      const matchesId = pub.institucion_id
        ? userInstIds.has(String(pub.institucion_id).trim())
        : false;

      const matchesName = pub.institucion_nombre
        ? userInstNames.has(pub.institucion_nombre.toLowerCase().trim())
        : false;

      const matchesLocation = pub.lugar_institucion
        ? userInstNames.has(pub.lugar_institucion.toLowerCase().trim())
        : false;

      return matchesId || matchesName || matchesLocation;
    });
  }, [objects, user]);

  const displayedObjects = limit ? filteredObjects.slice(0, limit) : filteredObjects;

  if (!displayedObjects || displayedObjects.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No hay objetos recientes en tus instituciones."
        description="Cuando alguien publique un objeto perdido o encontrado en tus instituciones, lo vas a ver acá."
        compact
      />
    );
  }

  return (
    <div className="recent_objects_carousel no_scrollbar">
      {displayedObjects.map((object) => (
        <ObjectCard
          key={object.id}
          id={object.id}
          image={object.foto_principal_url || object.foto || ""}
          title={object.nombre}
          location={object.lugar_institucion || object.institucion_nombre || "Ubicación no especificada"}
          status={object.tipo}
          createdAt={object.fecha_evento || object.created_at}
        />
      ))}
    </div>
  );
};

export default RecentObjectsCarousel;
