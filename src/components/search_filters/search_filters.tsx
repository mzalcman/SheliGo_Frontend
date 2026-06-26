import "./search_filters.css";
import {
  Shapes,
  Building2,
  MapPin,
  CalendarDays,
  Lock,
  ScanSearch,
  ChevronDown,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import FilterChip from "../filter_chip/filter_chip";
import {
  getCategories,
  getInstitutions,
} from "../../services/filters_service";

interface SearchFiltersProps {
  openFilter: string;
  setOpenFilter: (value: string) => void;

  categoria: string;
  setCategoria: (value: string) => void;

  institucion: string;
  setInstitucion: (value: string) => void;

  lugar: string;
  setLugar: (value: string) => void;

  fecha: string;
  setFecha: (value: string) => void;

  tipo: string;
  setTipo: (value: string) => void;
}

const SearchFilters = ({
  openFilter,
  setOpenFilter,

  categoria,
  setCategoria,

  institucion,
  setInstitucion,

  lugar,
  setLugar,

  fecha,
  setFecha,

  tipo,
  setTipo,
}: SearchFiltersProps) => {

  const [categorias, setCategorias] =
    useState<any[]>([]);

  const [instituciones, setInstituciones] =
    useState<any[]>([]);

  useEffect(() => {

    const fetchFilters = async () => {

      try {

        const [
          categoriasData,
          institucionesData,
        ] = await Promise.all([
          getCategories(),
          getInstitutions(),
        ]);

        setCategorias(categoriasData);
        setInstituciones(institucionesData);

      } catch (error) {

        console.error(error);

      }

    };

    fetchFilters();

  }, []);

  const toggleFilter = (
    filter: string
  ) => {

    setOpenFilter(
      openFilter === filter
        ? ""
        : filter
    );

  };

  return (

    <div>

      <div className="search_filters">

        {/* CATEGORIA */}

        <button
          className={`search_filter ${
            openFilter === "categoria"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleFilter("categoria")
          }
        >

          <Shapes size={18} />

          <span>
            Categoría
          </span>

          {openFilter === "categoria"
            ? <X size={16} />
            : <ChevronDown size={16} />}

        </button>

        {/* INSTITUCION */}

        <button
          className={`search_filter ${
            openFilter === "institucion"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleFilter("institucion")
          }
        >

          <Building2 size={18} />

          <span>
            Institución
          </span>

          {openFilter === "institucion"
            ? <X size={16} />
            : <ChevronDown size={16} />}

        </button>

        {/* LUGAR */}

        <button
          className={`search_filter ${
            openFilter === "lugar"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleFilter("lugar")
          }
        >

          <MapPin size={18} />

          <span>
            Lugar
          </span>

          {openFilter === "lugar"
            ? <X size={16} />
            : <ChevronDown size={16} />}

        </button>

        {/* FECHA */}

        <button
          className={`search_filter ${
            openFilter === "fecha"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleFilter("fecha")
          }
        >

          <CalendarDays size={18} />

          <span>
            Fecha
          </span>

          {openFilter === "fecha"
            ? <X size={16} />
            : <ChevronDown size={16} />}

        </button>

        {/* PERDIDO */}

        <button
          className={`search_filter ${
            tipo === "perdido"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setTipo(
              tipo === "perdido"
                ? ""
                : "perdido"
            )
          }
        >

          <Lock size={18} />

          <span>
            Perdido
          </span>

        </button>

        {/* ENCONTRADO */}

        <button
          className={`search_filter ${
            tipo === "encontrado"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setTipo(
              tipo === "encontrado"
                ? ""
                : "encontrado"
            )
          }
        >

          <ScanSearch size={18} />

          <span>
            Encontrado
          </span>

        </button>

      </div>

      {/* CATEGORIAS */}

      {openFilter === "categoria" && (

        <div className="filter_chips_container">

          {categorias.map((item: any) => (

            <FilterChip
              key={item.id}
              label={item.nombre}
              active={
                categoria === item.id
              }
              onClick={() =>
                setCategoria(
                  categoria === item.id
                    ? ""
                    : item.id
                )
              }
            />

          ))}

        </div>

      )}

      {/* INSTITUCIONES */}

      {openFilter === "institucion" && (

        <div className="filter_chips_container">

          {instituciones.map((item: any) => (

            <FilterChip
              key={item.id}
              label={item.nombre}
              active={
                institucion === item.id
              }
              onClick={() =>
                setInstitucion(
                  institucion === item.id
                    ? ""
                    : item.id
                )
              }
            />

          ))}

        </div>

      )}

      {/* LUGAR */}

      {openFilter === "lugar" && (

        <div className="filter_chips_container">

          <input
            type="text"
            className="date_input"
            placeholder="Ej. Comedor"
            value={lugar}
            onChange={(e) =>
              setLugar(
                e.target.value
              )
            }
          />

        </div>

      )}

      {/* FECHA */}

      {openFilter === "fecha" && (

        <div className="filter_chips_container">

          <input
            type="date"
            className="date_input"
            value={fecha}
            onChange={(e) =>
              setFecha(
                e.target.value
              )
            }
          />

        </div>

      )}

    </div>
  );
};
export default SearchFilters;