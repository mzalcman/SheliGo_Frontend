import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Building2, ArrowRight } from "lucide-react";
import Loader from "../../components/loader/loader";
import { get_all_institutions } from "../../services/home_service";
import { completarInstituciones } from "../../services/auth_service";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/use_auth";
import BrandLogo from "../../components/brand_logo/brand_logo";
import "../../styles/auth.css";
import "../../styles/institution_picker.css";
import { get_api_error_message, get_api_error_status } from "../../services/api_error";
import type { FilterOption } from "../../types/filter_option";

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [availableInstitutions, setAvailableInstitutions] = useState<FilterOption[]>([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<FilterOption[]>([]);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FilterOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quien ya tiene sesión de SheliGo completó el onboarding: no vuelve a pasar por acá
  useEffect(() => {
    if (user && (user.instituciones?.length ?? 0) > 0) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await get_all_institutions();
        const instList =
          response?.data?.instituciones || response?.data || [];

        setAvailableInstitutions(instList);
      } catch (err) {
        console.error("Error al obtener instituciones:", err);
        setAvailableInstitutions([]);
      }
    };

    fetchInstitutions();
  }, []);

  const handleInstitutionQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setInstitutionQuery(value);

    if (value.trim().length > 0) {
      const cleanQuery = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const filtered = availableInstitutions.filter((inst) => {
        const cleanName = inst.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const alreadySelected = selectedInstitutions.some(
          (selected) => selected.id === inst.id
        );

        return cleanName.includes(cleanQuery) && !alreadySelected;
      });

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectInstitution = (inst: FilterOption) => {
    setSelectedInstitutions([...selectedInstitutions, inst]);
    setInstitutionQuery("");
    setSuggestions([]);
  };

  const handleRemoveInstitution = (instToRemove: FilterOption) => {
    setSelectedInstitutions(
      selectedInstitutions.filter((inst) => inst.id !== instToRemove.id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedInstitutions.length === 0) {
      setError(
        "Por favor, selecciona al menos una institución para continuar."
      );
      return;
    }

    try {
      setLoading(true);

      // Todavía no hay sesión de SheliGo: el backend valida la sesión de Google
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError(
          "Tu sesión de Google expiró. Por favor, vuelve a iniciar sesión."
        );
        return;
      }

      const instituciones_ids = selectedInstitutions.map((inst) => inst.id);

      const { token, usuario } = await completarInstituciones(
        instituciones_ids,
        session.access_token
      );

      if (!token || !usuario) {
        throw new Error("No se pudo completar el registro.");
      }

      // Recién ahora el usuario queda registrado y con sesión
      login(usuario, token);

      const redirectUrl = localStorage.getItem("redirect_after_login");
      localStorage.removeItem("redirect_after_login");
      navigate(redirectUrl || "/home", { replace: true });
    } catch (err) {
      if (get_api_error_status(err) === 401) {
        setError(
          "Tu sesión expiró o no es válida. Por favor, vuelve a iniciar sesión."
        );
      } else {
        setError(get_api_error_message(err, "Ocurrió un error al guardar tus instituciones."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="auth_page">
      <aside className="auth_brand_panel">
        <BrandLogo size="md" tone="light" />
        <div className="auth_brand_copy">
          <h2>Ya casi estás.</h2>
          <p>Elegí tus instituciones para ver los objetos perdidos y encontrados que te importan.</p>
        </div>
        <img src="/logo_sheligo.png" alt="" className="auth_brand_mark" />
      </aside>

      <div className="auth_main">
        <div className="auth_content">
          <header className="auth_header">
            <BrandLogo size="md" />
          </header>

          <div className="auth_card">
            <div className="auth_step_header">
              <span className="eyebrow">Último paso</span>
              <h1 className="auth_title">Un paso más...</h1>
              <p className="auth_subtitle">
                Selecciona las instituciones a las que perteneces para personalizar tu experiencia.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth_form">
              <div className="form_field">
                <label className="form_label">Instituciones asociadas</label>

                {selectedInstitutions.length > 0 && (
                  <div className="institutions_chips_container">
                    {selectedInstitutions.map((inst) => {
                      return (
                        <div className="institution_chip" key={inst.id}>
                          <span>{inst.nombre}</span>
                          <button
                            type="button"
                            aria-label={`Quitar ${inst.nombre}`}
                            onClick={() => handleRemoveInstitution(inst)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="institution_input_wrapper auth_input_icon">
                  <Building2 size={18} />
                  <input
                    type="text"
                    className="form_input"
                    placeholder="Escribe y selecciona tu institución..."
                    value={institutionQuery}
                    onChange={handleInstitutionQueryChange}
                  />

                  {suggestions.length > 0 && (
                    <ul className="institution_dropdown">
                      {suggestions.map((item) => {
                        return (
                          <li
                            key={item.id}
                            onClick={() => handleSelectInstitution(item)}
                          >
                            {item.nombre}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {error && <p className="form_alert form_alert_error">{error}</p>}

              <button type="submit" className="btn btn_primary btn_lg btn_block">
                Finalizar Registro
                <ArrowRight size={18} strokeWidth={2.4} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CompleteProfilePage;