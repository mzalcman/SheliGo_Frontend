import "./CompleteProfilePage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Loader from "../../components/loader/loader";
import { get_all_institutions } from "../../services/home_service";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/use_auth";

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [availableInstitutions, setAvailableInstitutions] = useState<any[]>([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<any[]>([]);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        const rawName =
          typeof inst === "string" ? inst : inst.nombre || inst.name || "";

        const cleanName = rawName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const instId =
          typeof inst === "string"
            ? inst
            : inst.id || inst.institucion_id;

        const alreadySelected = selectedInstitutions.some(
          (selected) =>
            (typeof selected === "string"
              ? selected
              : selected.id || selected.institucion_id) === instId
        );

        return cleanName.includes(cleanQuery) && !alreadySelected;
      });

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectInstitution = (inst: any) => {
    setSelectedInstitutions([...selectedInstitutions, inst]);
    setInstitutionQuery("");
    setSuggestions([]);
  };

  const handleRemoveInstitution = (instToRemove: any) => {
    const targetId =
      instToRemove.id ||
      instToRemove.institucion_id ||
      instToRemove;

    setSelectedInstitutions(
      selectedInstitutions.filter(
        (inst) =>
          (inst.id || inst.institucion_id || inst) !== targetId
      )
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

    // Obtener el token JWT de la sesión
    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "No se encontró una sesión activa. Por favor, vuelve a iniciar sesión."
      );
      return;
    }

    // Obtener únicamente los IDs de las instituciones
    const instituciones_ids = selectedInstitutions.map(
      (inst) => inst.id || inst.institucion_id || inst
    );

    console.log("Token encontrado:", !!token);
    console.log(
      "Instituciones que se enviarán:",
      instituciones_ids
    );

    // Guardar instituciones
    const response = await api.post(
      "/auth/completar-instituciones",
      {
        instituciones_ids,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "Respuesta completar instituciones:",
      response.data
    );

    if (response.data?.status !== "success") {
      throw new Error(
        response.data?.message ||
          "No se pudieron guardar las instituciones."
      );
    }

    // Obtener el usuario actualizado
    const userResponse = await api.get("/usuarios/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "Usuario actualizado:",
      userResponse.data
    );

    const updatedUser =
      userResponse.data?.data?.usuario;

    if (!updatedUser) {
      throw new Error(
        "No se pudo obtener el usuario actualizado."
      );
    }

    // Actualizar el contexto de autenticación
    login(updatedUser);

    // Mantener actualizado localStorage
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    // Ir al home
    navigate("/home");
  } catch (err: any) {
    console.error(
      "Error al completar instituciones:",
      err
    );

    console.error(
      "Respuesta del servidor:",
      err.response?.data
    );

    if (err.response?.status === 401) {
      setError(
        "Tu sesión expiró o no es válida. Por favor, vuelve a iniciar sesión."
      );
    } else {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Ocurrió un error al guardar tus instituciones."
      );
    }
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="login_page">
      <div className="login_top" />

      <div className="login_content">
        <h1 className="login_logo">SheliGo</h1>

        <div className="login_card complete_profile_card">
          <h2>Un paso más...</h2>

          <p className="login_subtitle_card">
            Selecciona las instituciones a las que
            <br />
            perteneces para personalizar tu
            <br />
            experiencia.
          </p>

          <form
            onSubmit={handleSubmit}
            className="complete_profile_form"
          >
            <label className="complete_label">
              Instituciones asociadas
            </label>

            {selectedInstitutions.length > 0 && (
              <div className="institutions_chips_container">
                {selectedInstitutions.map((inst) => {
                  const labelName =
                    typeof inst === "string"
                      ? inst
                      : inst.nombre || inst.name;

                  const instId =
                    typeof inst === "string"
                      ? inst
                      : inst.id || inst.institucion_id;

                  return (
                    <div
                      className="institution_chip"
                      key={instId}
                    >
                      <span>{labelName}</span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveInstitution(inst)
                        }
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="institution_input_wrapper">
              <input
                type="text"
                placeholder="Escribe y selecciona tu institución..."
                value={institutionQuery}
                onChange={handleInstitutionQueryChange}
              />

              {suggestions.length > 0 && (
                <ul className="institution_dropdown">
                  {suggestions.map((item) => {
                    const labelName =
                      typeof item === "string"
                        ? item
                        : item.nombre || item.name;

                    const itemId =
                      typeof item === "string"
                        ? item
                        : item.id || item.institucion_id;

                    return (
                      <li
                        key={itemId}
                        onClick={() =>
                          handleSelectInstitution(item)
                        }
                      >
                        {labelName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {error && (
              <p className="login_error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login_button complete_profile_button"
            >
              Finalizar Registro
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CompleteProfilePage;