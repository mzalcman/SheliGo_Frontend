import "./image_uploader.css";
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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    const nuevosArchivos = Array.from(event.target.files);

    const archivosUnicos = nuevosArchivos.filter((nuevo) => {
      const yaExiste = images.some(
        (existente) =>
          existente.name === nuevo.name &&
          existente.size === nuevo.size &&
          existente.lastModified === nuevo.lastModified
      );
      
      if (yaExiste) {
        console.warn(`La imagen "${nuevo.name}" ya está agregada.`);
      }
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
            <Camera
              size={32}
              color="black"
              strokeWidth={2.5}
            />
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
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      {images.length > 0 && (
        <div className="image_preview_container">
          {images.map((image, index) => (
            <div key={index} className="image_preview_wrapper">
              <img
                src={URL.createObjectURL(image)}
                className="image_preview"
                alt={`preview-${index}`}
              />
              <button
                type="button"
                className="remove_image_button"
                onClick={() => handleRemoveImage(index)}
              >
                <X size={14} color="#333" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ImageUploader;