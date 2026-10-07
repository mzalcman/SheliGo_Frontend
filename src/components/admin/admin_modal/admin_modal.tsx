import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import "./admin_modal.css";

interface AdminModalProps {
  is_open: boolean;
  title: string;
  description?: string;
  on_close: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
  // Mientras se guarda no se puede cerrar (evita perder la respuesta)
  busy?: boolean;
}

const AdminModal = ({ is_open, title, description, on_close, children, footer, size = "md", busy = false }: AdminModalProps) => {
  const title_id = useId();
  const dialog_ref = useRef<HTMLDivElement>(null);

  // Referencias para que el efecto no se reinicie en cada render (perdería el foco de los inputs)
  const on_close_ref = useRef(on_close);
  const busy_ref = useRef(busy);
  useEffect(() => {
    on_close_ref.current = on_close;
    busy_ref.current = busy;
  });

  useEffect(() => {
    if (!is_open) return;

    const previous_focus = document.activeElement as HTMLElement | null;
    const previous_overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog_ref.current?.focus();

    const on_key = (event: KeyboardEvent) => {
      // Con modales apilados, Escape cierra solo el de arriba
      const overlays = document.querySelectorAll(".admin_modal_overlay");
      const is_top = overlays[overlays.length - 1]?.contains(dialog_ref.current);
      if (event.key === "Escape" && is_top && !busy_ref.current) on_close_ref.current();
    };
    window.addEventListener("keydown", on_key);

    return () => {
      window.removeEventListener("keydown", on_key);
      document.body.style.overflow = previous_overflow;
      previous_focus?.focus();
    };
  }, [is_open]);

  if (!is_open) return null;

  /* Portal a <body>: las páginas tienen una animación con transform, que
     confinaría al overlay "fixed" dentro de la página en vez de la ventana. */
  return createPortal(
    <div
      className="admin_modal_overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) on_close();
      }}
    >
      <div
        ref={dialog_ref}
        className={`admin_modal admin_modal_${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title_id}
        tabIndex={-1}
      >
        <header className="admin_modal_header">
          <div>
            <h2 id={title_id} className="admin_modal_title">{title}</h2>
            {description && <p className="admin_modal_description">{description}</p>}
          </div>
          <button className="icon_button" onClick={on_close} disabled={busy} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        <div className="admin_modal_body">{children}</div>
        {footer && <footer className="admin_modal_footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
};

export default AdminModal;
