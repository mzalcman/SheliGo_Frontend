import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, ImagePlus, Trash2 } from "lucide-react";
import AdminModal from "../../../components/admin/admin_modal/admin_modal";
import { useAdminSession } from "../../../hooks/use_admin_session";
import {
  create_admin_institution,
  update_admin_institution,
} from "../../../services/admin/admin_institutions_service";
import { get_admin_error_message } from "../../../services/admin/admin_error";
import type { AdminInstitution, AdminInstitutionForm } from "../../../types/admin/admin_institution";

interface AdminInstitutionFormModalProps {
  // null = alta de una institución nueva
  institution: AdminInstitution | null;
  on_close: () => void;
  on_saved: () => void;
}

type FormErrors = Partial<Record<keyof AdminInstitutionForm | "foto", string>>;

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const to_form = (institution: AdminInstitution | null): AdminInstitutionForm => ({
  nombre: institution?.nombre ?? "",
  email: institution?.email ?? "",
  direccion: institution?.direccion ?? "",
  telefono: institution?.telefono ?? "",
  latitud: institution?.latitud?.toString() ?? "",
  longitud: institution?.longitud?.toString() ?? "",
});

// Mismas reglas que valida el backend (admin-schema.ts), para avisar antes de enviar
const validate = (form: AdminInstitutionForm): FormErrors => {
  const errors: FormErrors = {};
  const nombre = form.nombre.trim();
  if (nombre.length < 2 || nombre.length > 120) errors.nombre = "El nombre debe tener entre 2 y 120 caracteres.";
  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) errors.email = "El email no es válido.";
  if (form.direccion.trim().length > 200) errors.direccion = "Máximo 200 caracteres.";
  if (form.telefono.trim().length > 30) errors.telefono = "Máximo 30 caracteres.";

  const lat = form.latitud.trim();
  const lng = form.longitud.trim();
  if (Boolean(lat) !== Boolean(lng)) {
    errors.latitud = "Completá latitud y longitud juntas.";
  } else if (lat) {
    const lat_n = Number(lat);
    const lng_n = Number(lng);
    if (Number.isNaN(lat_n) || lat_n < -90 || lat_n > 90) errors.latitud = "Entre -90 y 90.";
    if (Number.isNaN(lng_n) || lng_n < -180 || lng_n > 180) errors.longitud = "Entre -180 y 180.";
  }
  return errors;
};

const AdminInstitutionFormModal = ({ institution, on_close, on_saved }: AdminInstitutionFormModalProps) => {
  const { notify } = useAdminSession();
  const is_edit = institution !== null;
  const [form, set_form] = useState<AdminInstitutionForm>(() => to_form(institution));
  const [errors, set_errors] = useState<FormErrors>({});
  const [photo, set_photo] = useState<File | null>(null);
  const [photo_preview, set_photo_preview] = useState<string | null>(institution?.foto ?? null);
  const [remove_photo, set_remove_photo] = useState(false);
  const [busy, set_busy] = useState(false);
  const [server_error, set_server_error] = useState<string | null>(null);
  const file_input = useRef<HTMLInputElement>(null);

  // Libera la URL temporal de la vista previa
  useEffect(() => {
    return () => {
      if (photo_preview?.startsWith("blob:")) URL.revokeObjectURL(photo_preview);
    };
  }, [photo_preview]);

  const update = (field: keyof AdminInstitutionForm, value: string) => {
    set_form((current) => ({ ...current, [field]: value }));
    set_errors((current) => {
      const next = { ...current, [field]: undefined };
      // Latitud y longitud se validan juntas: corregir una limpia el error de ambas
      if (field === "latitud" || field === "longitud") {
        next.latitud = undefined;
        next.longitud = undefined;
      }
      return next;
    });
  };

  const pick_photo = (file: File | undefined) => {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      set_errors((current) => ({ ...current, foto: "Solo JPG, PNG o WEBP." }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      set_errors((current) => ({ ...current, foto: "La imagen supera los 8 MB." }));
      return;
    }
    set_errors((current) => ({ ...current, foto: undefined }));
    set_photo(file);
    set_remove_photo(false);
    set_photo_preview(URL.createObjectURL(file));
  };

  const clear_photo = () => {
    set_photo(null);
    set_photo_preview(null);
    set_remove_photo(true);
    if (file_input.current) file_input.current.value = "";
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(form);
    set_errors(found);
    if (Object.values(found).some(Boolean)) return;

    set_busy(true);
    set_server_error(null);
    try {
      if (is_edit) {
        await update_admin_institution(institution.id, form, photo, remove_photo);
        notify(`Institución "${form.nombre.trim()}" actualizada`);
      } else {
        await create_admin_institution(form, photo);
        notify(`Institución "${form.nombre.trim()}" creada`);
      }
      on_saved();
    } catch (error) {
      set_server_error(get_admin_error_message(error, "No se pudo guardar la institución."));
      set_busy(false);
    }
  };

  const field = (name: keyof AdminInstitutionForm, label: string, props: { type?: string; placeholder?: string; wide?: boolean; required?: boolean; inputMode?: "decimal" | "tel" | "email" } = {}) => (
    <label className={`form_field ${props.wide ? "is_wide" : ""}`}>
      <span className="form_label">
        {label} {props.required && <span className="admin_required">*</span>}
      </span>
      <input
        className={`form_input ${errors[name] ? "input_error" : ""}`}
        type={props.type ?? "text"}
        inputMode={props.inputMode}
        placeholder={props.placeholder}
        value={form[name]}
        onChange={(event) => update(name, event.target.value)}
        aria-invalid={Boolean(errors[name])}
      />
      {errors[name] && <span className="field_error">{errors[name]}</span>}
    </label>
  );

  return (
    <AdminModal
      is_open
      size="lg"
      busy={busy}
      title={is_edit ? "Editar institución" : "Nueva institución"}
      description={is_edit ? institution.nombre : "Los usuarios la van a poder elegir al registrarse."}
      on_close={on_close}
      footer={
        <>
          <button type="button" className="btn btn_ghost" onClick={on_close} disabled={busy}>Cancelar</button>
          <button type="submit" form="admin_institution_form" className="btn btn_primary" disabled={busy}>
            {busy && <span className="spinner_small" />}
            {is_edit ? "Guardar cambios" : "Crear institución"}
          </button>
        </>
      }
    >
      <form id="admin_institution_form" className="admin_form" onSubmit={submit} noValidate>
        {server_error && (
          <div className="form_alert form_alert_error" role="alert">
            <AlertCircle size={18} />
            <span>{server_error}</span>
          </div>
        )}

        <div className="admin_photo_field">
          <span className="admin_thumb admin_photo_preview">
            {photo_preview ? <img src={photo_preview} alt="" /> : <ImagePlus size={22} />}
          </span>
          <div className="admin_photo_actions">
            <span className="form_label">Logo o foto</span>
            <span className="form_hint">JPG, PNG o WEBP de hasta 8 MB.</span>
            <div className="admin_detail_actions" style={{ marginTop: 4 }}>
              <button type="button" className="btn btn_secondary btn_sm" onClick={() => file_input.current?.click()}>
                {photo_preview ? "Cambiar" : "Subir imagen"}
              </button>
              {photo_preview && (
                <button type="button" className="btn btn_ghost btn_sm" onClick={clear_photo}>
                  <Trash2 size={16} />
                  Quitar
                </button>
              )}
            </div>
            {errors.foto && <span className="field_error">{errors.foto}</span>}
          </div>
          <input ref={file_input} type="file" accept={PHOTO_TYPES.join(",")} hidden
            onChange={(event) => pick_photo(event.target.files?.[0])} />
        </div>

        <div className="admin_form_grid">
          {field("nombre", "Nombre", { wide: true, required: true, placeholder: "Ej.: Colegio Nacional" })}
          {field("email", "Email de contacto", { type: "email", inputMode: "email", placeholder: "contacto@institucion.edu" })}
          {field("telefono", "Teléfono", { type: "tel", inputMode: "tel", placeholder: "011 4444-5555" })}
          {field("direccion", "Dirección", { wide: true, placeholder: "Calle 123, Ciudad" })}
          {field("latitud", "Latitud", { inputMode: "decimal", placeholder: "-34.6037" })}
          {field("longitud", "Longitud", { inputMode: "decimal", placeholder: "-58.3816" })}
        </div>
      </form>
    </AdminModal>
  );
};

export default AdminInstitutionFormModal;
