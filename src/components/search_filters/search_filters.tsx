import "./search_filters.css";
import { Shapes, Building2, CalendarDays, Lock, ScanSearch, ChevronDown, Trash2, } from "lucide-react";
import { useEffect, useState } from "react";
import BottomFilterModal from "../bottom_filter_modal/bottom_filter_modal";
import { getCategories, getInstitutions, } from "../../services/filters_service";

interface SearchFiltersProps {
  openFilter: string;
  setOpenFilter: (value: string) => void;

  categorias: string[];
  setCategorias: (value: string[]) => void;

  instituciones: string[];
  setInstituciones: (value: string[]) => void;

  fechaDesde: string;
  setFechaDesde: (value: string) => void;

  fechaHasta: string;
  setFechaHasta: (value: string) => void;

  tipo: string;
  setTipo: (value: string) => void;

  clearFilters: () => void;
}

const SearchFilters = ({
  openFilter, setOpenFilter,
  categorias, setCategorias,
  instituciones, setInstituciones,
  fechaDesde, setFechaDesde,
  fechaHasta, setFechaHasta,
  tipo, setTipo, clearFilters,
}: SearchFiltersProps) => {

  const [categoriasData, setCategoriasData] =
    useState<any[]>([]);

  const [institucionesData, setInstitucionesData] =
    useState<any[]>([]);

  // Limita el calendario nativo hasta el día de hoy
  const hoyLimiter = new Date().toISOString().split("T")[0];

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [
          categoriasResponse,
          institucionesResponse,
        ] = await Promise.all([

          getCategories(),
          getInstitutions(),

        ]);

        setCategoriasData(categoriasResponse);

        setInstitucionesData(
          institucionesResponse.sort(
            (a: any, b: any) =>
              a.nombre.localeCompare(b.nombre)
          )
        );

      } catch (error) {

        console.error(error);

      }

    };

    fetchData();

  }, []);

  const toggleFilter = (
    filter: string
  ) => {

    if (openFilter === filter) {

      setOpenFilter("");

      return;

    }

    setOpenFilter(filter);

  };
  const categoriasSeleccionadasTexto = () => {

    const nombres = categoriasData
      .filter((c: any) =>
        categorias.includes(c.id)
      )
      .map((c: any) => c.nombre);

    if (nombres.length === 0)
      return "Categorías";

    if (nombres.length <= 2)
      return `Categorías: ${nombres.join(", ")}`;

    return `Categorías: ${nombres[0]}, ${nombres[1]} +${nombres.length - 2}`;

  };

  const institucionesSeleccionadasTexto = () => {

    const nombres = institucionesData
      .filter((i: any) =>
        instituciones.includes(i.id)
      )
      .map((i: any) => i.nombre);

    if (nombres.length === 0)
      return "Instituciones";

    if (nombres.length <= 2)
      return `Instituciones: ${nombres.join(", ")}`;

    return `Instituciones: ${nombres[0]}, ${nombres[1]} +${nombres.length - 2}`;

  };

  const fechasSeleccionadasTexto = () => {
    if (!fechaDesde && !fechaHasta) return "Fecha";

    const formatearFechaCorta = (fechaStr: string) => {
      if (!fechaStr) return "";
      const [_anio, mes, dia] = fechaStr.split("-");
      return `${dia}/${mes}`;
    };

    const desdeFormateado = formatearFechaCorta(fechaDesde);
    const hastaFormateado = formatearFechaCorta(fechaHasta);

    if (fechaDesde && fechaHasta) {
      return `Fecha: ${desdeFormateado} - ${hastaFormateado}`;
    } else if (fechaDesde) {
      return `Fecha: ${desdeFormateado} - ...`;
    } else {
      return `Fecha: ... - ${hastaFormateado}`;
    }
  };

  return (

    <>

      <div className="search_filters">

        <button
          className={`search_filter ${openFilter === "categoria"
            ? "active"
            : ""
            }`}
          onClick={() =>
            toggleFilter("categoria")
          }
        >

          <Shapes size={18} />

          <span>
            {categoriasSeleccionadasTexto()}
          </span>

          <ChevronDown size={16} />

        </button>

        <button
          className={`search_filter ${openFilter === "institucion"
            ? "active"
            : ""
            }`}
          onClick={() =>
            toggleFilter("institucion")
          }
        >

          <Building2 size={18} />

          <span>
            {institucionesSeleccionadasTexto()}
          </span>

          <ChevronDown size={16} />

        </button>

        <button
          className={`search_filter ${openFilter === "fecha" || fechaDesde || fechaHasta
            ? "active"
            : ""
            }`}
          onClick={() =>
            toggleFilter("fecha")
          }
        >

          <CalendarDays size={18} />

          <span>
            {fechasSeleccionadasTexto()}
          </span>

          <ChevronDown size={16} />

        </button>

        <button
          className={`search_filter ${tipo === "perdido"
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

        <button
          className={`search_filter ${tipo === "encontrado"
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

        <button
          className="search_filter clear_filters_button"
          onClick={clearFilters}
        >
          <Trash2 size={18} />
          <span>Borrar</span>
        </button>

      </div>

      <BottomFilterModal
        open={openFilter === "categoria"}
        title="Categorías"
        items={categoriasData}
        selected={categorias}
        onChange={setCategorias}
        onClose={() => setOpenFilter("")}
      />


      <BottomFilterModal
        open={openFilter === "institucion"}
        title="Instituciones"
        items={institucionesData}
        selected={instituciones}
        onChange={setInstituciones}
        onClose={() => setOpenFilter("")}
      />

      <BottomFilterModal
        open={openFilter === "fecha"}
        title="Seleccionar fechas"
        onClose={() => setOpenFilter("")}
        onApply={() => setOpenFilter("")}
        onClear={() => {
          setFechaDesde("");
          setFechaHasta("");
        }}
      >
        <div className="date_range_container">
          <div className="date_field">
            <label>Desde</label>
            <input
              type="date"
              value={fechaDesde}
              max={hoyLimiter}
              onChange={(e) => {
                const valor = e.target.value;
                if (!valor) {
                  setFechaDesde("");
                  return;
                }

                const anio = valor.split("-")[0];
                if (anio && anio.length > 4) return;

                if (new Date(valor) > new Date(hoyLimiter)) {
                  setFechaDesde(hoyLimiter);
                } else {
                  setFechaDesde(valor);
                }
              }}
            />
          </div>

          <div className="date_field">
            <label>Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              max={hoyLimiter}
              min={fechaDesde || undefined}
              onChange={(e) => {
                const valor = e.target.value;
                if (!valor) {
                  setFechaHasta("");
                  return;
                }

                const anio = valor.split("-")[0];
                if (anio && anio.length > 4) return;

                if (new Date(valor) > new Date(hoyLimiter)) {
                  setFechaHasta(hoyLimiter);
                } else {
                  setFechaHasta(valor);
                }
              }}
            />
          </div>
        </div>
      </BottomFilterModal>

    </>

  );

};

export default SearchFilters;