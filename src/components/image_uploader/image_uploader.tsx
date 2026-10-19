import { useEffect, useMemo, useState } from "react";
import "./image_uploader.css";
import { ACCEPTED_IMAGE_INPUT, get_image_error } from "../../utils/image_rules";
import { Camera, X } from "lucide-react"; 

interface ImageUploaderProps {
  images: File[];
  setImages: (images: File[]) => void;
  maxFiles?: number;
}

const ImageUploader = ({
  images,
  setImages,
  maxFiles = 5,
}: ImageUploaderProps) => {
  const [error, setError] = useState("");

  // Una URL temporal por imagen, liberada cuando cambia la lista o se desmonta
  const previews = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    const seleccionados = Array.from(event.target.files);
    const errores = seleccionados.map(get_image_error).filter(Boolean);
    setError(errores.length > 0 ? `${errores[0]} Se omitieron ${errores.length} archivo(s).` : "");
    const nuevosArchivos = seleccionados.filter((archivo) => !get_image_error(archivo));

    const archivosUnicos = nuevosArchivos.filter((nuevo) => {
      const yaExiste = images.some(
        (existente) =>
          existente.name === nuevo.name &&
          existente.size === nuevo.size &&
          existente.lastModified === nuevo.lastModified
      );
      
      return !yaExiste;
    });

    if (archivosUnicos.length === 0) {
      event.target.value = ""; 
      return;
    }

    if (maxFiles === 1) {
      setImages([archivosUnicos[0]]);
    } else {
      const listaCombinada = [...images, ...archivosUnicos];
      setImages(listaCombinada.slice(0, maxFiles));
    }

    event.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="image_uploader">

      {images.length < maxFiles && (
        <label
          htmlFor="image_input"
          className="image_upload_box"
        >
          <div className="upload_icon">
            <Camera size={24} strokeWidth={2} />
          </div>

          <h3>Añadir foto</h3>

          <p>
            {maxFiles === 1 
              ? "Sube una foto clara para tu perfil." 
              : "Toma una foto clara del objeto o búscalo en tu galería. Hasta 5 fotos"}
          </p>
        </label>
      )}

      <input
        id="image_input"
        type="file"
        multiple={maxFiles > 1}
        accept={ACCEPTED_IMAGE_INPUT}
        hidden
        onChange={handleChange}
      />

      {images.length > 0 && (
        <div className="image_preview_container">
          {previews.map((preview, index) => (
            <div key={index} className="image_preview_wrapper">
              <img
                src={preview}
                className="image_preview"
                alt={`preview-${index}`}
              />
              <button
                type="button"
                className="remove_image_button"
                aria-label="Quitar imagen"
                onClick={() => handleRemoveImage(index)}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="form_alert form_alert_error">{error}</p>}
    </div>
  );
};

export default ImageUploader;