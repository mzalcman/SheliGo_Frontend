import React, { type ReactNode } from "react";
import "./modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: "success" | "error" | "confirm" | "default";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  children?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  variant = "default",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  children,
}) => {
  if (!isOpen) return null;

  // Asignamos la clase correcta al círculo del ícono según la variante
  const iconContainerClass = `modal_icon_circle ${
    variant === "error" 
      ? "error_icon_circle" 
      : variant === "success" 
      ? "success_icon_circle" 
      : variant === "confirm"
      ? "confirm_icon_circle" 
      : ""
  }`;

  return (
    <div className="modal_overlay">
      <div className="modal_container">
        {icon && <div className={iconContainerClass}>{icon}</div>}

        <h2 className="modal_title">{title}</h2>

        {description && <p className="modal_description_text">{description}</p>}

        {children && <div className="modal_custom_body">{children}</div>}

        <div className="modal_buttons_container">
          {variant === "confirm" && onConfirm ? (
            <>
              <button 
                className="modal_confirm_button confirm_brown" 
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button className="modal_cancel_button" onClick={onClose}>
                {cancelText}
              </button>
            </>
          ) : (
            <button
              className={variant === "error" ? "modal_error_button" : "modal_accept_button"}
              onClick={onConfirm || onClose}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;