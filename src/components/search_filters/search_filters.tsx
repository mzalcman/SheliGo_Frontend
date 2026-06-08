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

import FilterChip from "../filter_chip/filter_chip";

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

  // TEMPORAL
  // Después vendrá del backend

  const categorias = [
    "Mochilas",
    "Llaves",
    "Botellas",
    "Ropa",
  ];

  const instituciones = [
    "Club SheliGo",
    "ORT",
    "Macabi",
  ];

  const lugares = [
    "Baño sede",
    "Cancha principal",
    "Comedor",
  ];

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
            {categoria
              ? `Categoría: ${categoria}`
              : "Categoría"}
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
            {institucion
              ? `Institución: ${institucion}`
              : "Institución"}
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
            {lugar
              ? `Lugar: ${lugar}`
              : "Lugar"}
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
            {fecha
              ? `Fecha: ${fecha}`
              : "Fecha"}
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
          <span>Perdido</span>
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
          <span>Encontrado</span>
        </button>

      </div>

      {/* CATEGORIAS */}

      {openFilter === "categoria" && (

        <div className="filter_chips_container">

          {categorias.map(
            (item) => (

              <FilterChip
                key={item}
                label={item}
                active={categoria === item}
                onClick={() =>
                  setCategoria(
                    categoria === item
                      ? ""
                      : item
                  )
                }
              />
            )
          )}

        </div>
      )}

      {/* INSTITUCIONES */}

      {openFilter === "institucion" && (

        <div className="filter_chips_container">

          {instituciones.map(
            (item) => (

              <FilterChip
                key={item}
                label={item}
                active={
                  institucion === item
                }
                onClick={() =>
                  setInstitucion(
                    institucion === item
                      ? ""
                      : item
                  )
                }
              />
            )
          )}

        </div>
      )}

      {/* LUGARES */}

      {openFilter === "lugar" && (

        <div className="filter_chips_container">

          {lugares.map(
            (item) => (

              <FilterChip
                key={item}
                label={item}
                active={
                  lugar === item
                }
                onClick={() =>
                  setLugar(
                    lugar === item
                      ? ""
                      : item
                  )
                }
              />
            )
          )}

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