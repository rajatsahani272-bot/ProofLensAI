
import { FileImage, X } from "lucide-react";
import "./ImagePreview.css";

const ImagePreview = ({
  file,
  previewUrl,
  onRemove,
  disabled = false
}) => {
  if (!file || !previewUrl) return null;

  const sizeInMB = file.size / (1024 * 1024);

  return (
    <section className="image-preview">
      <div className="image-preview-visual">
        <img
          src={previewUrl}
          alt={`Preview of ${file.name}`}
        />

        <button
          type="button"
          className="image-preview-remove"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove selected image"
        >
          <X size={18} />
        </button>
      </div>

      <div className="image-preview-details">
        <div className="image-preview-file-icon">
          <FileImage size={21} />
        </div>

        <div className="image-preview-file-info">
          <strong title={file.name}>{file.name}</strong>
          <span>
            {sizeInMB < 1
              ? `${(file.size / 1024).toFixed(1)} KB`
              : `${sizeInMB.toFixed(2)} MB`}
            {" · "}
            Image ready
          </span>
        </div>
      </div>
    </section>
  );
};

export default ImagePreview;
