import "./image_uploader.css";
import { Camera } from "lucide-react";

interface ImageUploaderProps {
  images: File[];
  setImages: (
    images: File[]
  ) => void;
}

const ImageUploader = ({
  images,
  setImages,
}: ImageUploaderProps) => {

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!event.target.files) return;

    setImages([
      ...images,
      ...Array.from(event.target.files),
    ]);
  };

  return (
    <div className="image_uploader">

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
          Toma una foto clara del objeto
          o buscalo en tu galería.
        </p>
      </label>

      <input
        id="image_input"
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      {images.length > 0 && (

        <div className="image_preview_container">

          {images.map(
            (image, index) => (

              <img
                key={index}
                src={URL.createObjectURL(image)}
                className="image_preview"
              />
            )
          )}

        </div>

      )}

    </div>
  );
};

export default ImageUploader;